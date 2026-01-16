import { Scope } from "./scope";

export type BindDirection = "both" | "from" | "to";

function getElementValue(element: Element): string {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  if (element instanceof HTMLSelectElement) {
    return element.value;
  }
  return element.textContent ?? "";
}

function setElementValue(element: Element, value: string): void {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.value = value;
    element.setAttribute("value", value);
    return;
  }
  if (element instanceof HTMLSelectElement) {
    element.value = value;
    return;
  }
  if (element instanceof HTMLElement && element.querySelector("*")) {
    return;
  }
  element.textContent = value;
}

export function applyBindToScope(element: Element, expression: string, scope: Scope): void {
  const key = expression.trim();
  if (!key) {
    return;
  }

  const value = getElementValue(element);
  scope.set(key, value);
}

export function applyBindToElement(element: Element, expression: string, scope: Scope): void {
  const key = expression.trim();
  if (!key) {
    return;
  }
  const value = scope.get(key);
  if (value == null) {
    return;
  }
  setElementValue(element, String(value));
}
