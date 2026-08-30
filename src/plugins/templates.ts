import type { Engine } from "../runtime/engine";

type TemplateResult = {
  __vsnTemplate: true;
  strings: string[];
  values: any[];
};

type TrustedHtmlValue = {
  __vsnTrustedHtml: true;
  value: unknown;
};

const TRUSTED_HTML_KEY = "__vsnTrustedHtml";

export function registerTemplates(engine: Engine): () => void {
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

export default registerTemplates;

const globals = globalThis as Record<string, any>;
const plugins = globals.VSNPlugins ?? {};
plugins.templates = (instance: Engine) => registerTemplates(instance);
globals.VSNPlugins = plugins;

const autoEngine = globals.VSNEngine;
if (autoEngine && typeof autoEngine.registerGlobal === "function") {
  registerTemplates(autoEngine as Engine);
}

function html(stringsOrValue: TemplateStringsArray | string, ...values: any[]): TemplateResult {
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

function isTemplate(value: any): value is TemplateResult {
  return Boolean(value && typeof value === "object" && value.__vsnTemplate);
}

function isTrustedHtmlValue(value: any): value is TrustedHtmlValue {
  return Boolean(value && typeof value === "object" && value[TRUSTED_HTML_KEY]);
}

function isElement(value: any): value is Element {
  return typeof Element !== "undefined" && value instanceof Element;
}

function renderValue(value: any): string {
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

function renderTemplate(template: TemplateResult): string {
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

function renderToString(value: any): string {
  return isTemplate(value) || Array.isArray(value) || isElement(value)
    ? renderValue(value)
    : value == null ? "" : String(value);
}
