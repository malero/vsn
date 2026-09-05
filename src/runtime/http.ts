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

  const requestTarget = resolveTarget(element, config.targetSelector);
  const response = await globalThis.fetch(config.url, {
    headers: getPartialHeaders(element, requestTarget)
  });
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

export function getPartialHeaders(element: Element, target: Element | null): Headers {
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

function resolveTarget(element: Element, selector?: string): Element | null {
  if (!selector) {
    return element;
  }
  return element.ownerDocument.querySelector(selector);
}
