// src/runtime/lifetime.ts
function isAbortError(error) {
  return Boolean(
    error && typeof error === "object" && "name" in error && error.name === "AbortError"
  );
}
function throwIfAborted(signal) {
  if (!signal?.aborted) {
    return;
  }
  if (signal.reason) {
    throw signal.reason;
  }
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  throw error;
}

// src/runtime/http.ts
function getPartialHeaders(element, target) {
  const headers = new Headers();
  headers.set("HX-Request", "true");
  const currentUrl = element.ownerDocument.defaultView?.location.href;
  if (currentUrl) {
    headers.set("HX-Current-URL", currentUrl);
  }
  const targetId = target?.getAttribute("id");
  if (targetId) {
    headers.set("HX-Target", targetId);
  }
  const triggerId = element.getAttribute("id");
  if (triggerId) {
    headers.set("HX-Trigger", triggerId);
  }
  const triggerName = element.getAttribute("name");
  if (triggerName) {
    headers.set("HX-Trigger-Name", triggerName);
  }
  return headers;
}

// src/plugins/sanitize-html.ts
var TRUSTED_HTML_KEY = "__vsnTrustedHtml";
function registerSanitizeHtml(engine, options = {}) {
  const trustedElements = /* @__PURE__ */ new WeakSet();
  const sanitizer = resolveSanitizer(options);
  engine.registerHtmlTransformer((value, context) => {
    const { html, trusted } = unwrapTrustedHtml(value, context.element, trustedElements);
    context.trusted = context.trusted || trusted;
    return context.trusted ? html : sanitizePreservingVsnScripts(html, sanitizer);
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
    handle: (element, name, _value, _scope, context) => {
      const trusted = name.includes("!trusted");
      const autoLoad = name.includes("!load");
      const url = element.getAttribute(name) ?? "";
      const target = element.getAttribute("vsn-target") ?? void 0;
      const swap = element.getAttribute("vsn-swap") ?? "inner";
      const targetSelector = target ?? void 0;
      const ownerLifetime = context?.lifetime ?? engine.getLifetime(element);
      let requestLifetime;
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
              ...targetSelector ? { targetSelector } : {}
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
            requestLifetime = void 0;
          }
          operationLifetime.dispose();
        }
      };
      const clickHandler = (event) => {
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
  throwIfAborted(config.signal);
  const requestTarget = resolveTarget(element, config.targetSelector);
  const response = await globalThis.fetch(config.url, {
    headers: getPartialHeaders(element, requestTarget),
    ...config.signal ? { signal: config.signal } : {}
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
function sanitizePreservingVsnScripts(html, sanitizer) {
  const extracted = extractVsnScripts(html);
  const sanitized = sanitizer(extracted.html);
  return extracted.scripts.length > 0 ? `${sanitized}${extracted.scripts.join("")}` : sanitized;
}
function extractVsnScripts(html) {
  if (typeof document === "undefined") {
    const scripts2 = [];
    const withoutScripts = html.replace(
      /<script\b[^>]*\btype\s*=\s*["']?text\/vsn["']?[^>]*>[\s\S]*?<\/script\s*>/gi,
      (script) => {
        scripts2.push(script);
        return "";
      }
    );
    return { html: withoutScripts, scripts: scripts2 };
  }
  const template = document.createElement("template");
  template.innerHTML = html;
  const scripts = [];
  for (const script of Array.from(template.content.querySelectorAll("script"))) {
    if ((script.getAttribute("type") ?? "").trim().toLowerCase() !== "text/vsn") {
      continue;
    }
    scripts.push(script.outerHTML);
    script.remove();
  }
  return { html: template.innerHTML, scripts };
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