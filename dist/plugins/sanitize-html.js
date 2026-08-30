// src/plugins/sanitize-html.ts
var TRUSTED_HTML_KEY = "__vsnTrustedHtml";
function registerSanitizeHtml(engine, options = {}) {
  const trustedElements = /* @__PURE__ */ new WeakSet();
  const sanitizer = resolveSanitizer(options);
  engine.registerHtmlTransformer((value, context) => {
    const { html, trusted } = unwrapTrustedHtml(value, context.element, trustedElements);
    context.trusted = context.trusted || trusted;
    return context.trusted ? html : sanitizer(html);
  }, { priority: 200 });
  engine.registerFlag("trusted", {
    transformValue: ({ declaration }, value) => {
      const target = declaration?.target;
      if (target?.type === "Directive" && target?.name === "html") {
        return { [TRUSTED_HTML_KEY]: true, value };
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
var sanitize_html_default = registerSanitizeHtml;
var globals = globalThis;
var plugins = globals.VSNPlugins ?? {};
plugins.sanitizeHtml = (instance) => registerSanitizeHtml(instance);
globals.VSNPlugins = plugins;
var autoEngine = globals.VSNEngine;
if (autoEngine && typeof autoEngine.registerFlag === "function") {
  registerSanitizeHtml(autoEngine);
}
function unwrapTrustedHtml(value, element, trustedElements) {
  if (value && typeof value === "object" && value[TRUSTED_HTML_KEY]) {
    const html2 = value.value == null ? "" : String(value.value);
    return { html: html2, trusted: true };
  }
  const html = value == null ? "" : String(value);
  return { html, trusted: trustedElements.has(element) };
}
async function applyGetWithSanitize(engine, element, config, sanitizer, trustedElements) {
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
        for (const element2 of elements) {
          trustedElements.add(element2);
          engine.processHtml(element2);
        }
      }
    }
    return;
  }
  target.innerHTML = output;
  if (config.trusted) {
    trustedElements.add(target);
  }
  engine.processHtml(target);
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