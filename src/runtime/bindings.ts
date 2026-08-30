import { Scope } from "./scope";

export type BindDirection = "auto" | "both" | "from" | "to";

function isCheckableInput(element: Element): element is HTMLInputElement {
  return element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio");
}

function getElementValue(element: Element): unknown {
  if (isCheckableInput(element)) {
    return element.checked;
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  if (element instanceof HTMLSelectElement) {
    return element.value;
  }
  return element.textContent ?? "";
}

function setElementValue(element: Element, value: unknown): void {
  if (isCheckableInput(element)) {
    const checked = value === true || value === "true" || value === 1 || value === "1";
    element.checked = checked;
    if (checked) {
      element.setAttribute("checked", "");
    } else {
      element.removeAttribute("checked");
    }
    return;
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const nextValue = value == null ? "" : String(value);
    element.value = nextValue;
    element.setAttribute("value", nextValue);
    return;
  }
  if (element instanceof HTMLSelectElement) {
    element.value = value == null ? "" : String(value);
    return;
  }
  if (element instanceof HTMLElement && element.querySelector("*")) {
    return;
  }
  element.textContent = value == null ? "" : String(value);
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
