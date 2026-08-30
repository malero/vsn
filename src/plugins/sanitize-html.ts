import type { Engine } from "../runtime/engine";

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
    return context.trusted ? html : sanitizer(html);
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
    handle: (element, name) => {
      const trusted = name.includes("!trusted");
      const autoLoad = name.includes("!load");
      const url = element.getAttribute(name) ?? "";
      const target = element.getAttribute("vsn-target") ?? undefined;
      const swap = (element.getAttribute("vsn-swap") as "inner" | "outer" | null) ?? "inner";
      const targetSelector = target ?? undefined;

      const run = async () => {
        try {
          await applyGetWithSanitize(
            engine,
            element,
            {
              url,
              swap,
              trusted,
              ...(targetSelector ? { targetSelector } : {})
            },
            sanitizer,
            trustedElements
          );
        } catch (error) {
          console.warn("vsn:getError", error);
          element.dispatchEvent(new CustomEvent("vsn:getError", { detail: { error }, bubbles: true }));
        }
      };

      element.addEventListener("click", (event) => {
        if (event.target !== element) {
          return;
        }
        void run();
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
  config: { url: string; targetSelector?: string; swap?: "inner" | "outer"; trusted: boolean },
  sanitizer: (html: string) => string,
  trustedElements: WeakSet<Element>
): Promise<void> {
  if (!globalThis.fetch) {
    throw new Error("fetch is not available");
  }

  const response = await globalThis.fetch(config.url);
  if (!response || !response.ok) {
    return;
  }

  const html = await response.text();
  const target = resolveTarget(element, config.targetSelector);
  if (!target) {
    element.dispatchEvent(new CustomEvent("vsn:targetError", { detail: { selector: config.targetSelector } }));
    return;
  }

  const output = config.trusted ? html : sanitizer(html);
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
