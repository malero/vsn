import { Scope } from "./scope";

export function readCondition(expression: string, scope: Scope): boolean {
  const key = expression.trim();
  if (!key) {
    return false;
  }
  return !!scope.get(key);
}

export function applyShow(element: HTMLElement, expression: string, scope: Scope): void {
  // `hidden` is both a rendering and accessibility primitive. Unlike writing
  // `style.display`, it does not discard an author's existing display rule.
  element.hidden = !readCondition(expression, scope);
}
