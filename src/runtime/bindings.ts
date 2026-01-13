import { Scope } from "./scope";

export function applyBind(element: Element, expression: string, scope: Scope): void {
  const key = expression.trim();
  if (!key) {
    return;
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const value = element.value;
    if (value !== undefined && value !== "") {
      scope.set(key, value);
    }
    return;
  }

  const text = element.textContent?.trim();
  if (text) {
    scope.set(key, text);
  }
}
