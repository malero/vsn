import { applyHtml } from "./html";
import { Scope } from "./scope";

export interface GetConfig {
  url: string;
  targetSelector?: string;
  swap?: "inner" | "outer";
  trusted: boolean;
}

export async function applyGet(
  element: Element,
  config: GetConfig,
  scope: Scope
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
    const wrapper = document.createElement("div");
    applyHtml(wrapper, "__html", { get: () => html } as Scope, config.trusted);
    const replacement = wrapper.firstElementChild;
    if (replacement && target.parentNode) {
      target.parentNode.replaceChild(replacement, target);
    }
    return;
  }

  applyHtml(target as HTMLElement, "__html", { get: () => html } as Scope, config.trusted);
}

function resolveTarget(element: Element, selector?: string): Element | null {
  if (!selector) {
    return element;
  }
  return element.ownerDocument.querySelector(selector);
}
