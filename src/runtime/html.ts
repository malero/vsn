import { Scope } from "./scope";

export function applyHtml(
  element: HTMLElement,
  expression: string,
  scope: Scope
): void {
  const key = expression.trim();
  if (!key) {
    return;
  }
  const value = scope.get(key);
  const html = value == null ? "" : String(value);
  element.innerHTML = html;
}
