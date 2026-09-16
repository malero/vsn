// src/runtime/html-safety.ts
var TRUSTED_HTML_KEY = "__vsnTrustedHtml";
function unwrapTrustedHtml(value) {
  if (!value || typeof value !== "object") {
    return void 0;
  }
  const candidate = value;
  if (candidate[TRUSTED_HTML_KEY] !== true) {
    return void 0;
  }
  return { value: candidate.value, trusted: true };
}
function isTrustedHtmlValue(value) {
  return Boolean(unwrapTrustedHtml(value));
}

// src/plugins/templates.ts
function registerTemplates(engine) {
  engine.registerGlobal("html", html);
  return engine.registerHtmlTransformer((value) => {
    if (isTrustedHtmlValue(value)) {
      return {
        ...value,
        value: renderToString(value.value)
      };
    }
    if (isTemplate(value) || Array.isArray(value) || isElement(value)) {
      return renderToString(value);
    }
    return value;
  }, { priority: 100 });
}
var templates_default = registerTemplates;
var globals = globalThis;
var plugins = globals.VSNPlugins ?? {};
plugins.templates = (instance) => registerTemplates(instance);
globals.VSNPlugins = plugins;
var autoEngine = globals.VSNEngine;
if (autoEngine && typeof autoEngine.registerGlobal === "function") {
  registerTemplates(autoEngine);
}
function html(stringsOrValue, ...values) {
  if (Array.isArray(stringsOrValue)) {
    return {
      __vsnTemplate: true,
      strings: Array.from(stringsOrValue),
      values
    };
  }
  return {
    __vsnTemplate: true,
    strings: [String(stringsOrValue)],
    values: []
  };
}
function isTemplate(value) {
  return Boolean(value && typeof value === "object" && value.__vsnTemplate);
}
function isElement(value) {
  return typeof Element !== "undefined" && value instanceof Element;
}
function renderValue(value) {
  if (value == null) {
    return "";
  }
  if (isTemplate(value)) {
    return renderTemplate(value);
  }
  if (Array.isArray(value)) {
    return value.map(renderValue).join("");
  }
  if (isElement(value)) {
    return value.outerHTML;
  }
  return String(value);
}
function renderTemplate(template) {
  const { strings, values } = template;
  let output = "";
  for (let i = 0; i < strings.length; i += 1) {
    output += strings[i] ?? "";
    if (i < values.length) {
      output += renderValue(values[i]);
    }
  }
  return output;
}
function renderToString(value) {
  return isTemplate(value) || Array.isArray(value) || isElement(value) ? renderValue(value) : value == null ? "" : String(value);
}
export {
  templates_default as default,
  registerTemplates
};
//# sourceMappingURL=templates.js.map