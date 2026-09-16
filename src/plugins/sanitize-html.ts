import type { Engine } from "../runtime/engine";
import { getPartialHeaders } from "../runtime/http";
import { isAbortError, throwIfAborted } from "../runtime/lifetime";
import type { Lifetime } from "../runtime/lifetime";

type SanitizerOptions = {
  dompurifyConfig?: Record<string, any>;
  sanitizer?: (html: string) => string;
};

type TrustedHtmlValue = { __vsnTrustedHtml: true; value: any };

const TRUSTED_HTML_KEY = "__vsnTrustedHtml";

export function registerSanitizeHtml(engine: Engine, options: SanitizerOptions = {}): void {
  const trustedElements = new WeakSet<Element>();
  const sanitizer = resolveSanitizer(options);

  engine.registerHtmlTransformer((value, context) => {
    const { html, trusted } = unwrapTrustedHtml(value, context.element, trustedElements);
    context.trusted = context.trusted || trusted;
    return context.trusted ? html : sanitizePreservingVsnScripts(html, sanitizer);
  }, { priority: 200 });

  engine.registerFlag("trusted", {
    transformValue: ({ declaration }, value) => {
      const target = (declaration as any)?.target;
      if (target?.type === "Directive" && target?.name === "html") {
        return { [TRUSTED_HTML_KEY]: true, value } as TrustedHtmlValue;
      }
      return value;
    }
  });

  engine.registerAttributeHandler({
    id: "vsn-get",
    match: (name) => name.startsWith("vsn-get"),
    handle: (element, name, _value, _scope, context) => {
      const trusted = name.includes("!trusted");
      const autoLoad = name.includes("!load");
      const url = element.getAttribute(name) ?? "";
      const target = element.getAttribute("vsn-target") ?? undefined;
      const swap = (element.getAttribute("vsn-swap") as "inner" | "outer" | null) ?? "inner";
      const targetSelector = target ?? undefined;
      const ownerLifetime = context?.lifetime ?? engine.getLifetime(element);
      let requestLifetime: Lifetime | undefined;

      const run = async () => {
        if (ownerLifetime.isDisposed || !element.isConnected) {
          return;
        }
        requestLifetime?.dispose();
        const operationLifetime = ownerLifetime.child();
        requestLifetime = operationLifetime;
        try {
          await applyGetWithSanitize(
            engine,
            element,
            {
              url,
              swap,
              trusted,
              signal: operationLifetime.signal,
              ...(targetSelector ? { targetSelector } : {})
            },
            sanitizer,
            trustedElements
          );
        } catch (error) {
          if (operationLifetime.signal.aborted || ownerLifetime.signal.aborted || isAbortError(error)) {
            return;
          }
          console.warn("vsn:getError", error);
          element.dispatchEvent(new CustomEvent("vsn:getError", { detail: { error }, bubbles: true }));
        } finally {
          if (requestLifetime === operationLifetime) {
            requestLifetime = undefined;
          }
          operationLifetime.dispose();
        }
      };

      const clickHandler = (event: Event) => {
        if (event.target !== element) {
          return;
        }
        void run();
      };
      element.addEventListener("click", clickHandler);
      context?.onCleanup(() => {
        requestLifetime?.dispose();
        element.removeEventListener("click", clickHandler);
      });
      if (autoLoad) {
        Promise.resolve().then(run);
      }
      return true;
    }
  });
}

export default registerSanitizeHtml;

const globals = globalThis as Record<string, any>;
const plugins = globals.VSNPlugins ?? {};
plugins.sanitizeHtml = (instance: Engine) => registerSanitizeHtml(instance);
globals.VSNPlugins = plugins;

const autoEngine = globals.VSNEngine;
if (autoEngine && typeof autoEngine.registerFlag === "function") {
  registerSanitizeHtml(autoEngine as Engine);
}

function unwrapTrustedHtml(
  value: any,
  element: Element,
  trustedElements: WeakSet<Element>
): { html: string; trusted: boolean } {
  if (value && typeof value === "object" && value[TRUSTED_HTML_KEY]) {
    const html = value.value == null ? "" : String(value.value);
    return { html, trusted: true };
  }
  const html = value == null ? "" : String(value);
  return { html, trusted: trustedElements.has(element) };
}

async function applyGetWithSanitize(
  engine: Engine,
  element: Element,
  config: {
    url: string;
    targetSelector?: string;
    swap?: "inner" | "outer";
    trusted: boolean;
    signal?: AbortSignal;
  },
  sanitizer: (html: string) => string,
  trustedElements: WeakSet<Element>
): Promise<void> {
  if (!globalThis.fetch) {
    throw new Error("fetch is not available");
  }
  throwIfAborted(config.signal);

  const requestTarget = resolveTarget(element, config.targetSelector);
  const response = await globalThis.fetch(config.url, {
    headers: getPartialHeaders(element, requestTarget),
    ...(config.signal ? { signal: config.signal } : {})
  });
  throwIfAborted(config.signal);
  if (!response || !response.ok) {
    return;
  }

  const html = await response.text();
  throwIfAborted(config.signal);
  const target = resolveTarget(element, config.targetSelector);
  if (!target) {
    element.dispatchEvent(new CustomEvent("vsn:targetError", { detail: { selector: config.targetSelector } }));
    return;
  }

  const output = config.trusted ? html : sanitizePreservingVsnScripts(html, sanitizer);
  if (config.swap === "outer") {
    const wrapper = target.ownerDocument.createElement("div");
    wrapper.innerHTML = output;
    const replacements = Array.from(wrapper.childNodes);
    const elements = Array.from(wrapper.children);
    if (replacements.length > 0 && target.parentNode) {
      const fragment = target.ownerDocument.createDocumentFragment();
      fragment.append(...replacements);
      target.parentNode.replaceChild(fragment, target);
      if (config.trusted) {
        for (const element of elements) {
          trustedElements.add(element);
          engine.processHtml(element);
        }
      }
    }
    return;
  }

  (target as HTMLElement).innerHTML = output;
  if (config.trusted) {
    trustedElements.add(target);
  }
  engine.processHtml(target);
}

function resolveTarget(element: Element, selector?: string): Element | null {
  if (!selector) {
    return element;
  }
  return element.ownerDocument.querySelector(selector);
}

function resolveSanitizer(options: SanitizerOptions): (html: string) => string {
  if (options.sanitizer) {
    return options.sanitizer;
  }
  const purifier = (globalThis as any).DOMPurify;
  if (purifier && typeof purifier.sanitize === "function") {
    return (html) => purifier.sanitize(html, options.dompurifyConfig ?? {});
  }
  return fallbackSanitize;
}

function sanitizePreservingVsnScripts(
  html: string,
  sanitizer: (html: string) => string
): string {
  const extracted = extractVsnScripts(html);
  const sanitized = sanitizer(extracted.html);
  return extracted.scripts.length > 0
    ? `${sanitized}${extracted.scripts.join("")}`
    : sanitized;
}

function extractVsnScripts(html: string): { html: string; scripts: string[] } {
  if (typeof document === "undefined") {
    const scripts: string[] = [];
    const withoutScripts = html.replace(
      /<script\b[^>]*\btype\s*=\s*["']?text\/vsn["']?[^>]*>[\s\S]*?<\/script\s*>/gi,
      (script) => {
        scripts.push(script);
        return "";
      }
    );
    return { html: withoutScripts, scripts };
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  const scripts: string[] = [];
  for (const script of Array.from(template.content.querySelectorAll("script"))) {
    if ((script.getAttribute("type") ?? "").trim().toLowerCase() !== "text/vsn") {
      continue;
    }
    scripts.push(script.outerHTML);
    script.remove();
  }
  return { html: template.innerHTML, scripts };
}

function fallbackSanitize(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  }
  const template = document.createElement("template");
  template.innerHTML = html;
  const scripts = template.content.querySelectorAll("script");
  scripts.forEach((script) => script.remove());
  const elements = template.content.querySelectorAll("*");
  for (const element of Array.from(elements)) {
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith("on")) {
        element.removeAttribute(attr.name);
        continue;
      }
      if ((name === "href" || name === "src") && value.trim().toLowerCase().startsWith("javascript:")) {
        element.removeAttribute(attr.name);
      }
    }
  }
  return template.innerHTML;
}
