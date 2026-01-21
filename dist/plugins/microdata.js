// src/plugins/microdata.ts
var META_TYPE = "@type";
var META_ID = "@id";
function registerMicrodata(engine) {
  engine.registerBehaviorModifier("microdata", {
    onBind: ({ element, scope, args }) => {
      const options = normalizeOptions(args);
      const root = resolveItemscopeRoot(element);
      if (!root) {
        return;
      }
      const data = extractMicrodata(root, options);
      applyMicrodataToScope(scope, data, options);
    }
  });
  engine.registerGlobal("microdata", (target, maybeOptions) => {
    const options = normalizeOptions(
      isPlainObject(target) ? target : maybeOptions
    );
    const root = resolveTargetElement(engine, target);
    if (!root) {
      return void 0;
    }
    const data = extractMicrodata(resolveItemscopeRoot(root) ?? root, options);
    if (typeof target === "string" && !isPlainObject(maybeOptions)) {
      return data[target];
    }
    return data;
  });
}
var microdata_default = registerMicrodata;
var globals = globalThis;
var plugins = globals.VSNPlugins ?? {};
plugins.microdata = (instance) => registerMicrodata(instance);
globals.VSNPlugins = plugins;
var autoEngine = globals.VSNEngine;
if (autoEngine && typeof autoEngine.registerBehaviorModifier === "function") {
  registerMicrodata(autoEngine);
}
function normalizeOptions(value) {
  if (!value) {
    return {};
  }
  if (typeof value === "string") {
    return { key: value };
  }
  if (isPlainObject(value)) {
    const options = {};
    if (typeof value.key === "string") {
      options.key = value.key;
    }
    if (typeof value.flatten === "boolean") {
      options.flatten = value.flatten;
    }
    return options;
  }
  return {};
}
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function resolveTargetElement(engine, target) {
  if (!target) {
    return engine.getCurrentElement();
  }
  if (target instanceof Element) {
    return target;
  }
  if (Array.isArray(target) && target[0] instanceof Element) {
    return target[0];
  }
  return engine.getCurrentElement();
}
function resolveItemscopeRoot(element) {
  if (element.hasAttribute("itemscope")) {
    return element;
  }
  return element.querySelector("[itemscope]") ?? void 0;
}
function extractMicrodata(root, options) {
  const result = {};
  const itemType = root.getAttribute("itemtype");
  const itemId = root.getAttribute("itemid");
  if (itemType) {
    result[META_TYPE] = itemType;
  }
  if (itemId) {
    result[META_ID] = itemId;
  }
  collectItemProps(root, result, options);
  return result;
}
function collectItemProps(root, result, options) {
  const children = Array.from(root.children);
  for (const child of children) {
    const hasItemprop = child.hasAttribute("itemprop");
    const hasItemscope = child.hasAttribute("itemscope");
    if (hasItemscope && !hasItemprop) {
      continue;
    }
    if (hasItemprop) {
      const props = (child.getAttribute("itemprop") ?? "").split(/\s+/).map((prop) => prop.trim()).filter(Boolean);
      const value = hasItemscope ? extractMicrodata(child, options) : readItemValue(child);
      for (const prop of props) {
        addValue(result, prop, value);
      }
      if (options.flatten && value && typeof value === "object" && !Array.isArray(value)) {
        for (const [key, nestedValue] of Object.entries(value)) {
          if (key.startsWith("@")) {
            continue;
          }
          addValue(result, key, nestedValue);
        }
      }
      if (hasItemscope) {
        continue;
      }
    }
    collectItemProps(child, result, options);
  }
}
function readItemValue(element) {
  if (element instanceof HTMLMetaElement) {
    return element.content ?? "";
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value ?? "";
  }
  if (element instanceof HTMLSelectElement) {
    return element.value ?? "";
  }
  if (element instanceof HTMLTimeElement) {
    return element.dateTime || element.getAttribute("datetime") || "";
  }
  if (element instanceof HTMLAnchorElement || element instanceof HTMLLinkElement) {
    return element.getAttribute("href") ?? "";
  }
  if (element instanceof HTMLImageElement) {
    return element.getAttribute("src") ?? "";
  }
  if (element.hasAttribute("content")) {
    return element.getAttribute("content") ?? "";
  }
  return (element.textContent ?? "").trim();
}
function addValue(result, key, value) {
  if (result[key] === void 0) {
    result[key] = value;
    return;
  }
  if (Array.isArray(result[key])) {
    result[key].push(value);
    return;
  }
  result[key] = [result[key], value];
}
function applyMicrodataToScope(scope, data, options) {
  if (options.key) {
    scope.setPath?.(options.key, data);
    return;
  }
  for (const [key, value] of Object.entries(data)) {
    if (key === META_TYPE) {
      scope.setPath?.("itemtype", value);
      continue;
    }
    if (key === META_ID) {
      scope.setPath?.("itemid", value);
      continue;
    }
    scope.setPath?.(key, value);
  }
}
export {
  microdata_default as default,
  registerMicrodata
};
//# sourceMappingURL=microdata.js.map