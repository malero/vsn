import { Scope } from "./scope";

function sanitizeHtml(value: string): string {
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

export function applyHtml(
  element: HTMLElement,
  expression: string,
  scope: Scope,
  trusted: boolean
): void {
  const key = expression.trim();
  if (!key) {
    return;
  }
  const value = scope.get(key);
  const html = value == null ? "" : String(value);
  element.innerHTML = trusted ? html : sanitizeHtml(html);
}
