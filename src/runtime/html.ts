import { Scope } from "./scope";
import { resolveHtmlSanitizer, sanitizeVsnMarkup } from "./html-safety";

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
  element.innerHTML = sanitizeVsnMarkup(html, resolveHtmlSanitizer());
}
