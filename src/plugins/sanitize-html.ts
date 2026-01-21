import type { Engine } from "../runtime/engine";

type SanitizerOptions = {
  dompurifyConfig?: Record<string, any>;
  sanitizer?: (html: string) => string;
};

type HtmlBinding = { expr: string; trusted: boolean };
type TrustedHtmlValue = { __vsnTrustedHtml: true; value: any };

const TRUSTED_HTML_KEY = "__vsnTrustedHtml";

export function registerSanitizeHtml(engine: Engine, options: SanitizerOptions = {}): void {
  const htmlBindings = new WeakMap<Element, HtmlBinding>();
  const trustedElements = new WeakSet<Element>();
  const sanitizer = resolveSanitizer(options);
  const handleHtmlBehaviors = (engine as any).handleHtmlBehaviors?.bind(engine);

  engine.registerFlag("trusted", {
    transformValue: ({ declaration }, value) => {
      const target = (declaration as any)?.target;
      if (target?.type === "Directive" && target?.name === "html") {
        return { [TRUSTED_HTML_KEY]: true, value } as TrustedHtmlValue;
      }
      return value;
    }
  });

  patchAttributeHandlers(engine, htmlBindings, trustedElements, sanitizer, handleHtmlBehaviors);
  patchDirectiveSetter(engine, trustedElements, sanitizer, handleHtmlBehaviors);
  patchEvaluate(engine, htmlBindings, trustedElements, sanitizer, handleHtmlBehaviors);
  patchBehaviorDeclarations(engine, trustedElements);
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

function patchAttributeHandlers(
  engine: Engine,
  htmlBindings: WeakMap<Element, HtmlBinding>,
  trustedElements: WeakSet<Element>,
  sanitizer: (html: string) => string,
  handleHtmlBehaviors?: (root: Element) => void
): void {
  const handlers: any[] = (engine as any).attributeHandlers ?? [];
  (engine as any).attributeHandlers = handlers.filter((handler) => handler?.id !== "vsn-html" && handler?.id !== "vsn-get");

  engine.registerAttributeHandler({
    id: "vsn-html",
    match: (name) => name.startsWith("vsn-html"),
    handle: (element, name, value, scope) => {
      const trusted = name.includes("!trusted");
      htmlBindings.set(element, { expr: value, trusted });
      if ((engine as any).markInlineDeclaration) {
        (engine as any).markInlineDeclaration(element, "attr:html");
      }
      const apply = () => {
        const html = scope.get(value);
        const raw = html == null ? "" : String(html);
        element.innerHTML = trusted ? raw : sanitizer(raw);
        if (trusted) {
          trustedElements.add(element);
          handleHtmlBehaviors?.(element);
        }
      };
      apply();
      if ((engine as any).watch) {
        (engine as any).watch(scope, value, apply, element);
      }
      return true;
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
            handleHtmlBehaviors,
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

function patchDirectiveSetter(
  engine: Engine,
  trustedElements: WeakSet<Element>,
  sanitizer: (html: string) => string,
  handleHtmlBehaviors?: (root: Element) => void
): void {
  const originalSet = (engine as any).setDirectiveValue?.bind(engine);
  if (!originalSet) {
    return;
  }
  (engine as any).setDirectiveValue = (element: Element, target: any, value: any) => {
    if (target?.kind === "attr" && target?.name === "html" && element instanceof HTMLElement) {
      const { html, trusted } = unwrapTrustedHtml(value, element, trustedElements);
      element.innerHTML = trusted ? html : sanitizer(html);
      if (trusted) {
        handleHtmlBehaviors?.(element);
      }
      return;
    }
    return originalSet(element, target, value);
  };
}

function patchEvaluate(
  engine: Engine,
  htmlBindings: WeakMap<Element, HtmlBinding>,
  trustedElements: WeakSet<Element>,
  sanitizer: (html: string) => string,
  handleHtmlBehaviors?: (root: Element) => void
): void {
  const originalEvaluate = engine.evaluate.bind(engine);
  engine.evaluate = (element: Element) => {
    originalEvaluate(element);
    const binding = htmlBindings.get(element);
    if (!binding || !(element instanceof HTMLElement)) {
      return;
    }
    const scope = engine.getScope(element);
    const html = scope.get(binding.expr);
    const raw = html == null ? "" : String(html);
    element.innerHTML = binding.trusted ? raw : sanitizer(raw);
    if (binding.trusted) {
      trustedElements.add(element);
      handleHtmlBehaviors?.(element);
    }
  };
}

function patchBehaviorDeclarations(engine: Engine, trustedElements: WeakSet<Element>): void {
  const originalApply = (engine as any).applyBehaviorDeclaration?.bind(engine);
  if (!originalApply) {
    return;
  }
  (engine as any).applyBehaviorDeclaration = async (
    element: Element,
    scope: any,
    declaration: any,
    rootScope?: any
  ) => {
    const target = declaration?.target;
    if (declaration?.flags?.trusted && target?.type === "Directive" && target?.name === "html") {
      trustedElements.add(element);
    }
    return originalApply(element, scope, declaration, rootScope);
  };
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
  handleHtmlBehaviors?: (root: Element) => void,
  trustedElements?: WeakSet<Element>
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
    const wrapper = document.createElement("div");
    wrapper.innerHTML = output;
    const replacement = wrapper.firstElementChild;
    if (replacement && target.parentNode) {
      target.parentNode.replaceChild(replacement, target);
      if (config.trusted) {
        trustedElements?.add(replacement);
        handleHtmlBehaviors?.(replacement);
      }
    }
    return;
  }

  (target as HTMLElement).innerHTML = output;
  if (config.trusted) {
    trustedElements?.add(target);
    handleHtmlBehaviors?.(target);
  }
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
