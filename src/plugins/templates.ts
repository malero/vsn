import type { Engine } from "../runtime/engine";

type TemplateResult = {
  __vsnTemplate: true;
  strings: string[];
  values: any[];
};

type TemplateInstance = {
  strings: string[];
  textParts: Map<number, PartSlot>;
  attrParts: AttributePart[];
};

type PartSlot = {
  marker: Comment;
  nodes: Node[];
};

type AttributePart = {
  element: Element;
  name: string;
  strings: string[];
  indices: number[];
};

export function registerTemplates(engine: Engine): void {
  const htmlBindings = new WeakMap<Element, string>();
  const templateInstances = new WeakMap<Element, TemplateInstance>();
  const handleHtmlBehaviors = (engine as any).handleHtmlBehaviors?.bind(engine);

  engine.registerGlobal("html", html);

  patchAttributeHandlers(engine, htmlBindings, templateInstances, handleHtmlBehaviors);
  patchDirectiveSetter(engine, templateInstances, handleHtmlBehaviors);
  patchEvaluate(engine, htmlBindings, templateInstances, handleHtmlBehaviors);
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
  if (value instanceof Element) {
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
  if (isTemplate(value) || Array.isArray(value) || value instanceof Element) {
    return renderValue(value);
  }
  return value == null ? "" : String(value);
}

function renderHtml(
  element: Element,
  value: any,
  instances: WeakMap<Element, TemplateInstance>,
  handleHtmlBehaviors?: (root: Element) => void
): void {
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

function sameTemplate(a: string[], b: string[]): boolean {
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

function buildInstance(template: TemplateResult): TemplateInstance & { fragment: DocumentFragment } {
  const strings = template.strings.slice();
  const textParts = new Map<number, PartSlot>();
  const attrParts: AttributePart[] = [];
  const html = buildTemplateHtml(strings);
  const container = document.createElement("template");
  container.innerHTML = html;
  const fragment = container.content;
  collectTextParts(fragment, textParts);
  collectAttributeParts(fragment, attrParts);
  return { strings, textParts, attrParts, fragment };
}

function buildTemplateHtml(strings: string[]): string {
  let output = strings[0] ?? "";
  for (let i = 1; i < strings.length; i += 1) {
    output += `__vsn-part-${i - 1}__${strings[i] ?? ""}`;
  }
  return output;
}

function parsePartIndexToken(value: string): number | undefined {
  const match = value.match(/^__vsn-part-(\d+)__$/);
  if (!match) {
    return undefined;
  }
  return Number(match[1]);
}

function collectTextParts(fragment: DocumentFragment, textParts: Map<number, PartSlot>): void {
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
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

function collectAttributeParts(fragment: DocumentFragment, attrParts: AttributePart[]): void {
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT, null);
  let node = walker.nextNode();
  while (node) {
    const element = node as Element;
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

function splitByPartTokens(value: string):
  | { type: "text"; value: string }[]
  | { type: "part"; index: number }[]
  | ( { type: "text"; value: string } | { type: "part"; index: number } )[]
  | null {
  const parts: Array<{ type: "text"; value: string } | { type: "part"; index: number }> = [];
  const regex = /__vsn-part-(\d+)__/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value))) {
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

function parseAttributeParts(value: string): { strings: string[]; indices: number[] } | null {
  const regex = /__vsn-part-(\d+)__/g;
  let lastIndex = 0;
  const strings: string[] = [];
  const indices: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value))) {
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

function updateInstance(instance: TemplateInstance, template: TemplateResult): void {
  for (const [index, slot] of instance.textParts.entries()) {
    const value = template.values[index];
    updatePart(slot, value);
  }
  for (const part of instance.attrParts) {
    let value = part.strings[0] ?? "";
    for (let i = 0; i < part.indices.length; i += 1) {
      const index = part.indices[i];
      if (index === undefined) {
        continue;
      }
      const nextValue = template.values[index];
      value += renderValue(nextValue);
      value += part.strings[i + 1] ?? "";
    }
    part.element.setAttribute(part.name, value);
  }
}

function updatePart(slot: PartSlot, value: any): void {
  if (!slot.marker.parentNode) {
    return;
  }
  for (const node of slot.nodes) {
    node.parentNode?.removeChild(node);
  }
  slot.nodes = [];
  const fragment = document.createDocumentFragment();
  if (value == null) {
    // no-op
  } else if (isTemplate(value)) {
    const html = renderTemplate(value);
    slot.nodes = appendHtml(fragment, html);
  } else if (Array.isArray(value)) {
    const html = value.map(renderValue).join("");
    slot.nodes = appendHtml(fragment, html);
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

function appendHtml(fragment: DocumentFragment, html: string): Node[] {
  const container = document.createElement("template");
  container.innerHTML = html;
  const nodes = Array.from(container.content.childNodes);
  fragment.appendChild(container.content);
  return nodes;
}

function patchAttributeHandlers(
  engine: Engine,
  htmlBindings: WeakMap<Element, string>,
  instances: WeakMap<Element, TemplateInstance>,
  handleHtmlBehaviors?: (root: Element) => void
): void {
  const handlers: any[] = (engine as any).attributeHandlers ?? [];
  (engine as any).attributeHandlers = handlers.filter((handler) => handler?.id !== "vsn-html");

  engine.registerAttributeHandler({
    id: "vsn-html",
    match: (name) => name.startsWith("vsn-html"),
    handle: (element, _name, value, scope) => {
      htmlBindings.set(element, value);
      if ((engine as any).markInlineDeclaration) {
        (engine as any).markInlineDeclaration(element, "attr:html");
      }
      const apply = () => {
        const htmlValue = scope.get(value);
        renderHtml(element, htmlValue, instances, handleHtmlBehaviors);
      };
      apply();
      if ((engine as any).watch) {
        (engine as any).watch(scope, value, apply, element);
      }
      return true;
    }
  });
}

function patchDirectiveSetter(
  engine: Engine,
  instances: WeakMap<Element, TemplateInstance>,
  handleHtmlBehaviors?: (root: Element) => void
): void {
  const originalSet = (engine as any).setDirectiveValue?.bind(engine);
  if (!originalSet) {
    return;
  }
  (engine as any).setDirectiveValue = (element: Element, target: any, value: any) => {
    if (target?.kind === "attr" && target?.name === "html") {
      renderHtml(element, value, instances, handleHtmlBehaviors);
      return;
    }
    return originalSet(element, target, value);
  };
}

function patchEvaluate(
  engine: Engine,
  htmlBindings: WeakMap<Element, string>,
  instances: WeakMap<Element, TemplateInstance>,
  handleHtmlBehaviors?: (root: Element) => void
): void {
  const originalEvaluate = engine.evaluate.bind(engine);
  engine.evaluate = (element: Element) => {
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
