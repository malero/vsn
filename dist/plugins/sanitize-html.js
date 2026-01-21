// src/plugins/sanitize-html.ts
var TRUSTED_HTML_KEY = "__vsnTrustedHtml";
function registerSanitizeHtml(engine, options = {}) {
  const htmlBindings = /* @__PURE__ */ new WeakMap();
  const trustedElements = /* @__PURE__ */ new WeakSet();
  const sanitizer = resolveSanitizer(options);
  const handleHtmlBehaviors = engine.handleHtmlBehaviors?.bind(engine);
  engine.registerFlag("trusted", {
    transformValue: ({ declaration }, value) => {
      const target = declaration?.target;
      if (target?.type === "Directive" && target?.name === "html") {
        return { [TRUSTED_HTML_KEY]: true, value };
      }
      return value;
    }
  });
  patchAttributeHandlers(engine, htmlBindings, trustedElements, sanitizer, handleHtmlBehaviors);
  patchDirectiveSetter(engine, trustedElements, sanitizer, handleHtmlBehaviors);
  patchEvaluate(engine, htmlBindings, trustedElements, sanitizer, handleHtmlBehaviors);
  patchBehaviorDeclarations(engine, trustedElements);
}
var sanitize_html_default = registerSanitizeHtml;
var globals = globalThis;
var plugins = globals.VSNPlugins ?? {};
plugins.sanitizeHtml = (instance) => registerSanitizeHtml(instance);
globals.VSNPlugins = plugins;
var autoEngine = globals.VSNEngine;
if (autoEngine && typeof autoEngine.registerFlag === "function") {
  registerSanitizeHtml(autoEngine);
}
function patchAttributeHandlers(engine, htmlBindings, trustedElements, sanitizer, handleHtmlBehaviors) {
  const handlers = engine.attributeHandlers ?? [];
  engine.attributeHandlers = handlers.filter((handler) => handler?.id !== "vsn-html" && handler?.id !== "vsn-get");
  engine.registerAttributeHandler({
    id: "vsn-html",
    match: (name) => name.startsWith("vsn-html"),
    handle: (element, name, value, scope) => {
      const trusted = name.includes("!trusted");
      htmlBindings.set(element, { expr: value, trusted });
      if (engine.markInlineDeclaration) {
        engine.markInlineDeclaration(element, "attr:html");
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
      if (engine.watch) {
        engine.watch(scope, value, apply, element);
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
      const target = element.getAttribute("vsn-target") ?? void 0;
      const swap = element.getAttribute("vsn-swap") ?? "inner";
      const targetSelector = target ?? void 0;
      const run = async () => {
        try {
          await applyGetWithSanitize(
            engine,
            element,
            {
              url,
              swap,
              trusted,
              ...targetSelector ? { targetSelector } : {}
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
function patchDirectiveSetter(engine, trustedElements, sanitizer, handleHtmlBehaviors) {
  const originalSet = engine.setDirectiveValue?.bind(engine);
  if (!originalSet) {
    return;
  }
  engine.setDirectiveValue = (element, target, value) => {
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
function patchEvaluate(engine, htmlBindings, trustedElements, sanitizer, handleHtmlBehaviors) {
  const originalEvaluate = engine.evaluate.bind(engine);
  engine.evaluate = (element) => {
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
function patchBehaviorDeclarations(engine, trustedElements) {
  const originalApply = engine.applyBehaviorDeclaration?.bind(engine);
  if (!originalApply) {
    return;
  }
  engine.applyBehaviorDeclaration = async (element, scope, declaration, rootScope) => {
    const target = declaration?.target;
    if (declaration?.flags?.trusted && target?.type === "Directive" && target?.name === "html") {
      trustedElements.add(element);
    }
    return originalApply(element, scope, declaration, rootScope);
  };
}
function unwrapTrustedHtml(value, element, trustedElements) {
  if (value && typeof value === "object" && value[TRUSTED_HTML_KEY]) {
    const html2 = value.value == null ? "" : String(value.value);
    return { html: html2, trusted: true };
  }
  const html = value == null ? "" : String(value);
  return { html, trusted: trustedElements.has(element) };
}
async function applyGetWithSanitize(engine, element, config, sanitizer, handleHtmlBehaviors, trustedElements) {
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
  target.innerHTML = output;
  if (config.trusted) {
    trustedElements?.add(target);
    handleHtmlBehaviors?.(target);
  }
}
function resolveTarget(element, selector) {
  if (!selector) {
    return element;
  }
  return element.ownerDocument.querySelector(selector);
}
function resolveSanitizer(options) {
  if (options.sanitizer) {
    return options.sanitizer;
  }
  const purifier = globalThis.DOMPurify;
  if (purifier && typeof purifier.sanitize === "function") {
    return (html) => purifier.sanitize(html, options.dompurifyConfig ?? {});
  }
  return fallbackSanitize;
}
function fallbackSanitize(html) {
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
export {
  sanitize_html_default as default,
  registerSanitizeHtml
};
//# sourceMappingURL=sanitize-html.js.map