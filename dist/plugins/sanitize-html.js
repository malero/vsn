// src/runtime/html-safety.ts
var DEFAULT_DOMPURIFY_CONFIG = {
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: /^vsn-[a-z][a-z0-9-]*$/i,
    attributeNameCheck: null,
    allowCustomizedBuiltInElements: false
  }
};
var BLOCKED_ELEMENTS = /* @__PURE__ */ new Set([
  "base",
  "embed",
  "iframe",
  "link",
  "meta",
  "object",
  "script",
  "style",
  "svg",
  "template"
]);
var BLOCKED_ATTRIBUTES = /* @__PURE__ */ new Set([
  "action",
  "formaction",
  "is",
  "srcdoc",
  "xlink:href"
]);
var URL_ATTRIBUTES = /* @__PURE__ */ new Set([
  "cite",
  "href",
  "poster",
  "src"
]);
function resolveHtmlSanitizer(options = {}) {
  if (options.sanitizer) {
    return options.sanitizer;
  }
  return (html) => {
    const purifier = globalThis.DOMPurify;
    if (purifier && typeof purifier.sanitize === "function") {
      const config = {
        ...DEFAULT_DOMPURIFY_CONFIG,
        ...options.dompurifyConfig ?? {}
      };
      if (options.dompurifyConfig?.CUSTOM_ELEMENT_HANDLING === void 0) {
        config.CUSTOM_ELEMENT_HANDLING = { ...DEFAULT_DOMPURIFY_CONFIG.CUSTOM_ELEMENT_HANDLING };
      }
      return String(purifier.sanitize(html, config));
    }
    return fallbackSanitize(html);
  };
}
function fallbackSanitize(html) {
  if (typeof document === "undefined") {
    return html.replace(/<\s*(?:base|embed|iframe|link|meta|object|script|style|svg|template)\b[^>]*>[\s\S]*?<\/\s*(?:base|embed|iframe|link|meta|object|script|style|svg|template)\s*>/gi, "").replace(/<\s*(?:base|embed|iframe|link|meta|object|script|style|svg|template)\b[^>]*\/?\s*>/gi, "").replace(/\s+(?:on[\w:-]+|vsn-[\w:-]+|action|formaction|is|srcdoc|xlink:href)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/\s+(?:cite|href|poster|src)\s*=\s*(?:"\s*(?:javascript|vbscript|data):[^" ]*"|'\s*(?:javascript|vbscript|data):[^' ]*'|\s*(?:javascript|vbscript|data):[^\s>]+)/gi, "");
  }
  const template = document.createElement("template");
  template.innerHTML = html;
  const elements = Array.from(template.content.querySelectorAll("*"));
  for (const element of elements) {
    if (BLOCKED_ELEMENTS.has(element.tagName.toLowerCase())) {
      element.remove();
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name.startsWith("vsn-") || name === "style" || BLOCKED_ATTRIBUTES.has(name) || URL_ATTRIBUTES.has(name) && !isSafeUrl(attribute.value, name) || name === "srcset" && !isSafeUrl(attribute.value, name)) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return template.innerHTML;
}
function isSafeUrl(value, attributeName) {
  const normalized = value.replace(/[\u0000-\u0020\u007f]/g, "").toLowerCase();
  if (attributeName === "srcset") {
    return !/(?:^|[\s,])(?:javascript|vbscript|data):/i.test(normalized);
  }
  if (!normalized || normalized.startsWith("#") || normalized.startsWith("/") || normalized.startsWith("./") || normalized.startsWith("../") || normalized.startsWith("?")) {
    return true;
  }
  try {
    const protocol = new URL(value, document.baseURI).protocol.toLowerCase();
    return protocol === "http:" || protocol === "https:" || attributeName === "href" && (protocol === "mailto:" || protocol === "tel:");
  } catch {
    return false;
  }
}

// src/plugins/sanitize-html.ts
function registerSanitizeHtml(engine, options = {}) {
  return engine.registerHtmlSanitizer(resolveHtmlSanitizer(options));
}
var sanitize_html_default = registerSanitizeHtml;
var globals = globalThis;
var plugins = globals.VSNPlugins ?? {};
plugins.sanitizeHtml = (instance) => registerSanitizeHtml(instance);
globals.VSNPlugins = plugins;
var autoEngine = globals.VSNEngine;
if (autoEngine && typeof autoEngine.registerHtmlSanitizer === "function") {
  registerSanitizeHtml(autoEngine);
}
export {
  sanitize_html_default as default,
  registerSanitizeHtml
};
//# sourceMappingURL=sanitize-html.js.map