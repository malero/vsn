import { Scope } from "./scope";

function readCondition(expression: string, scope: Scope): boolean {
  const key = expression.trim();
  if (!key) {
    return false;
  }
  return !!scope.get(key);
}

function applyDisplay(element: HTMLElement, expression: string, scope: Scope): void {
  element.style.display = readCondition(expression, scope) ? "" : "none";
}

// `vsn-if` and `vsn-show` intentionally share visibility-only semantics.
export function applyIf(element: HTMLElement, expression: string, scope: Scope): void {
  applyDisplay(element, expression, scope);
}

export function applyShow(element: HTMLElement, expression: string, scope: Scope): void {
  applyDisplay(element, expression, scope);
}
