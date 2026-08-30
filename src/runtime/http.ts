import { applyHtml } from "./html";
import { Scope } from "./scope";

export interface GetConfig {
  url: string;
  targetSelector?: string;
  swap?: "inner" | "outer";
}

export async function applyGet(
  element: Element,
  config: GetConfig,
  scope: Scope,
  onHtmlApplied?: (target: Element) => void
): Promise<void> {
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

  if (config.swap === "outer") {
    const wrapper = target.ownerDocument.createElement("div");
    applyHtml(wrapper, "__html", { get: () => html } as unknown as Scope);
    const replacements = Array.from(wrapper.childNodes);
    const elements = Array.from(wrapper.children);
    if (replacements.length > 0 && target.parentNode) {
      const fragment = target.ownerDocument.createDocumentFragment();
      fragment.append(...replacements);
      target.parentNode.replaceChild(fragment, target);
      for (const element of elements) {
        onHtmlApplied?.(element);
      }
    }
    return;
  }

  applyHtml(target as HTMLElement, "__html", { get: () => html } as unknown as Scope);
  onHtmlApplied?.(target);
}

function resolveTarget(element: Element, selector?: string): Element | null {
  if (!selector) {
    return element;
  }
  return element.ownerDocument.querySelector(selector);
}
