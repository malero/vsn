// src/plugins/templates.ts
function registerTemplates(engine) {
  const htmlBindings = /* @__PURE__ */ new WeakMap();
  const templateInstances = /* @__PURE__ */ new WeakMap();
  const handleHtmlBehaviors = engine.handleHtmlBehaviors?.bind(engine);
  engine.registerGlobal("html", html);
  patchAttributeHandlers(engine, htmlBindings, templateInstances, handleHtmlBehaviors);
  patchDirectiveSetter(engine, templateInstances, handleHtmlBehaviors);
  patchEvaluate(engine, htmlBindings, templateInstances, handleHtmlBehaviors);
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
  if (value instanceof Element) {
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
  if (isTemplate(value) || Array.isArray(value) || value instanceof Element) {
    return renderValue(value);
  }
  return value == null ? "" : String(value);
}
function renderHtml(element, value, instances, handleHtmlBehaviors) {
  if (!(element instanceof HTMLElement)) {
    return;
  }
  if (isTemplate(value)) {
    const instance = instances.get(element);
    if (instance && sameTemplate(instance.strings, value.strings)) {
      updateInstance(instance, value);
      return;
    }
    const next = buildInstance(value);
    instances.set(element, next);
    element.innerHTML = "";
    element.appendChild(next.fragment);
    updateInstance(next, value);
    handleHtmlBehaviors?.(element);
    return;
  }
  instances.delete(element);
  element.innerHTML = renderToString(value);
  handleHtmlBehaviors?.(element);
}
function sameTemplate(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
function buildInstance(template) {
  const strings = template.strings.slice();
  const textParts = /* @__PURE__ */ new Map();
  const attrParts = [];
  const html2 = buildTemplateHtml(strings);
  const container = document.createElement("template");
  container.innerHTML = html2;
  const fragment = container.content;
  collectTextParts(fragment, textParts);
  collectAttributeParts(fragment, attrParts);
  return { strings, textParts, attrParts, fragment };
}
function buildTemplateHtml(strings) {
  let output = strings[0] ?? "";
  for (let i = 1; i < strings.length; i += 1) {
    output += `__vsn-part-${i - 1}__${strings[i] ?? ""}`;
  }
  return output;
}
function collectTextParts(fragment, textParts) {
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();
  while (node) {
    const textNode = node;
    const value = textNode.textContent ?? "";
    if (value.includes("__vsn-part-")) {
      const pieces = splitByPartTokens(value);
      if (pieces) {
        const replacement = document.createDocumentFragment();
        for (const piece of pieces) {
          if (piece.type === "text") {
            replacement.appendChild(document.createTextNode(piece.value));
          } else {
            const marker = document.createComment(`vsn-part-${piece.index}`);
            textParts.set(piece.index, { marker, nodes: [] });
            replacement.appendChild(marker);
          }
        }
        const next = walker.nextNode();
        textNode.replaceWith(replacement);
        node = next;
        continue;
      }
    }
    node = walker.nextNode();
  }
}
function collectAttributeParts(fragment, attrParts) {
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT, null);
  let node = walker.nextNode();
  while (node) {
    const element = node;
    for (const attr of Array.from(element.attributes)) {
      if (!attr.value.includes("__vsn-part-")) {
        continue;
      }
      const parsed = parseAttributeParts(attr.value);
      if (!parsed) {
        continue;
      }
      attrParts.push({ element, name: attr.name, strings: parsed.strings, indices: parsed.indices });
    }
    node = walker.nextNode();
  }
}
function splitByPartTokens(value) {
  const parts = [];
  const regex = /__vsn-part-(\d+)__/g;
  let lastIndex = 0;
  let match;
  while (match = regex.exec(value)) {
    const start = match.index;
    if (start > lastIndex) {
      parts.push({ type: "text", value: value.slice(lastIndex, start) });
    }
    const index = Number(match[1]);
    if (Number.isFinite(index)) {
      parts.push({ type: "part", index });
    }
    lastIndex = regex.lastIndex;
  }
  if (parts.length === 0) {
    return null;
  }
  if (lastIndex < value.length) {
    parts.push({ type: "text", value: value.slice(lastIndex) });
  }
  return parts;
}
function parseAttributeParts(value) {
  const regex = /__vsn-part-(\d+)__/g;
  let lastIndex = 0;
  const strings = [];
  const indices = [];
  let match;
  while (match = regex.exec(value)) {
    strings.push(value.slice(lastIndex, match.index));
    indices.push(Number(match[1]));
    lastIndex = regex.lastIndex;
  }
  if (indices.length === 0) {
    return null;
  }
  strings.push(value.slice(lastIndex));
  return { strings, indices };
}
function updateInstance(instance, template) {
  for (const [index, slot] of instance.textParts.entries()) {
    const value = template.values[index];
    updatePart(slot, value);
  }
  for (const part of instance.attrParts) {
    let value = part.strings[0] ?? "";
    for (let i = 0; i < part.indices.length; i += 1) {
      const index = part.indices[i];
      if (index === void 0) {
        continue;
      }
      const nextValue = template.values[index];
      value += renderValue(nextValue);
      value += part.strings[i + 1] ?? "";
    }
    part.element.setAttribute(part.name, value);
  }
}
function updatePart(slot, value) {
  if (!slot.marker.parentNode) {
    return;
  }
  for (const node of slot.nodes) {
    node.parentNode?.removeChild(node);
  }
  slot.nodes = [];
  const fragment = document.createDocumentFragment();
  if (value == null) {
  } else if (isTemplate(value)) {
    const html2 = renderTemplate(value);
    slot.nodes = appendHtml(fragment, html2);
  } else if (Array.isArray(value)) {
    const html2 = value.map(renderValue).join("");
    slot.nodes = appendHtml(fragment, html2);
  } else if (value instanceof Element) {
    fragment.appendChild(value);
    slot.nodes = [value];
  } else {
    const text = document.createTextNode(String(value));
    fragment.appendChild(text);
    slot.nodes = [text];
  }
  slot.marker.after(fragment);
}
function appendHtml(fragment, html2) {
  const container = document.createElement("template");
  container.innerHTML = html2;
  const nodes = Array.from(container.content.childNodes);
  fragment.appendChild(container.content);
  return nodes;
}
function patchAttributeHandlers(engine, htmlBindings, instances, handleHtmlBehaviors) {
  const handlers = engine.attributeHandlers ?? [];
  engine.attributeHandlers = handlers.filter((handler) => handler?.id !== "vsn-html");
  engine.registerAttributeHandler({
    id: "vsn-html",
    match: (name) => name.startsWith("vsn-html"),
    handle: (element, _name, value, scope) => {
      htmlBindings.set(element, value);
      if (engine.markInlineDeclaration) {
        engine.markInlineDeclaration(element, "attr:html");
      }
      const apply = () => {
        const htmlValue = scope.get(value);
        renderHtml(element, htmlValue, instances, handleHtmlBehaviors);
      };
      apply();
      if (engine.watch) {
        engine.watch(scope, value, apply, element);
      }
      return true;
    }
  });
}
function patchDirectiveSetter(engine, instances, handleHtmlBehaviors) {
  const originalSet = engine.setDirectiveValue?.bind(engine);
  if (!originalSet) {
    return;
  }
  engine.setDirectiveValue = (element, target, value) => {
    if (target?.kind === "attr" && target?.name === "html") {
      renderHtml(element, value, instances, handleHtmlBehaviors);
      return;
    }
    return originalSet(element, target, value);
  };
}
function patchEvaluate(engine, htmlBindings, instances, handleHtmlBehaviors) {
  const originalEvaluate = engine.evaluate.bind(engine);
  engine.evaluate = (element) => {
    originalEvaluate(element);
    const binding = htmlBindings.get(element);
    if (!binding) {
      return;
    }
    const scope = engine.getScope(element);
    const htmlValue = scope.get(binding);
    renderHtml(element, htmlValue, instances, handleHtmlBehaviors);
  };
}
export {
  templates_default as default,
  registerTemplates
};
//# sourceMappingURL=templates.js.map