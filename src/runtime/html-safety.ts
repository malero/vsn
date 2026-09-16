export type HtmlSanitizer = (html: string) => string;

export type HtmlSanitizerOptions = {
  dompurifyConfig?: Record<string, any>;
  sanitizer?: HtmlSanitizer;
};

export type TrustedHtmlValue = {
  readonly __vsnTrustedHtml: true;
  readonly value: unknown;
};

export const TRUSTED_HTML_KEY = "__vsnTrustedHtml";

const DEFAULT_DOMPURIFY_CONFIG = {
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: /^vsn-[a-z][a-z0-9-]*$/i,
    attributeNameCheck: null,
    allowCustomizedBuiltInElements: false
  }
};

const BLOCKED_ELEMENTS = new Set([
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

const BLOCKED_ATTRIBUTES = new Set([
  "action",
  "formaction",
  "is",
  "srcdoc",
  "xlink:href"
]);

const URL_ATTRIBUTES = new Set([
  "cite",
  "href",
  "poster",
  "src"
]);

export function markTrustedHtml(value: unknown): TrustedHtmlValue {
  return {
    [TRUSTED_HTML_KEY]: true,
    value
  } as TrustedHtmlValue;
}

export function unwrapTrustedHtml(value: unknown): { value: unknown; trusted: true } | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const candidate = value as Record<string, unknown>;
  if (candidate[TRUSTED_HTML_KEY] !== true) {
    return undefined;
  }
  return { value: candidate.value, trusted: true };
}

export function isTrustedHtmlValue(value: unknown): value is TrustedHtmlValue {
  return Boolean(unwrapTrustedHtml(value));
}

export function resolveHtmlSanitizer(options: HtmlSanitizerOptions = {}): HtmlSanitizer {
  if (options.sanitizer) {
    return options.sanitizer;
  }

  return (html) => {
    const purifier = (globalThis as Record<string, any>).DOMPurify;
    if (purifier && typeof purifier.sanitize === "function") {
      const config = {
        ...DEFAULT_DOMPURIFY_CONFIG,
        ...(options.dompurifyConfig ?? {})
      };
      if (options.dompurifyConfig?.CUSTOM_ELEMENT_HANDLING === undefined) {
        config.CUSTOM_ELEMENT_HANDLING = { ...DEFAULT_DOMPURIFY_CONFIG.CUSTOM_ELEMENT_HANDLING };
      }
      return String(purifier.sanitize(html, config));
    }
    return fallbackSanitize(html);
  };
}

export function sanitizeVsnMarkup(html: string, sanitizer: HtmlSanitizer): string {
  return stripUnsafeVsnMarkup(sanitizer(html));
}

function stripUnsafeVsnMarkup(html: string): string {
  if (typeof document === "undefined") {
    return html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
      .replace(/\s+vsn-[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, "");
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  for (const script of Array.from(template.content.querySelectorAll("script"))) {
    script.remove();
  }
  for (const element of Array.from(template.content.querySelectorAll("*"))) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase().startsWith("vsn-")) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return template.innerHTML;
}

function fallbackSanitize(html: string): string {
  if (typeof document === "undefined") {
    return html
      .replace(/<\s*(?:base|embed|iframe|link|meta|object|script|style|svg|template)\b[^>]*>[\s\S]*?<\/\s*(?:base|embed|iframe|link|meta|object|script|style|svg|template)\s*>/gi, "")
      .replace(/<\s*(?:base|embed|iframe|link|meta|object|script|style|svg|template)\b[^>]*\/?\s*>/gi, "")
      .replace(/\s+(?:on[\w:-]+|vsn-[\w:-]+|action|formaction|is|srcdoc|xlink:href)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\s+(?:cite|href|poster|src)\s*=\s*(?:"\s*(?:javascript|vbscript|data):[^" ]*"|'\s*(?:javascript|vbscript|data):[^' ]*'|\s*(?:javascript|vbscript|data):[^\s>]+)/gi, "");
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
      if (
        name.startsWith("on")
        || name.startsWith("vsn-")
        || name === "style"
        || BLOCKED_ATTRIBUTES.has(name)
        || (URL_ATTRIBUTES.has(name) && !isSafeUrl(attribute.value, name))
        || (name === "srcset" && !isSafeUrl(attribute.value, name))
      ) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return template.innerHTML;
}

function isSafeUrl(value: string, attributeName: string): boolean {
  const normalized = value.replace(/[\u0000-\u0020\u007f]/g, "").toLowerCase();
  if (attributeName === "srcset") {
    return !/(?:^|[\s,])(?:javascript|vbscript|data):/i.test(normalized);
  }
  if (!normalized || normalized.startsWith("#") || normalized.startsWith("/") || normalized.startsWith("./") || normalized.startsWith("../") || normalized.startsWith("?")) {
    return true;
  }
  try {
    const protocol = new URL(value, document.baseURI).protocol.toLowerCase();
    return protocol === "http:" || protocol === "https:" || (attributeName === "href" && (protocol === "mailto:" || protocol === "tel:"));
  } catch {
    return false;
  }
}
