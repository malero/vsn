import { Scope } from "./scope";
import { applyBindToElement, applyBindToScope, BindDirection } from "./bindings";
import { applyIf, applyShow } from "./conditionals";
import { applyHtml } from "./html";
import { applyGet, GetConfig } from "./http";
import { debounce } from "./debounce";

interface OnConfig {
  event: string;
  code: string;
  debounceMs?: number;
}

interface BindConfig {
  expr: string;
  direction: BindDirection;
}

export class Engine {
  private scopes = new WeakMap<Element, Scope>();
  private bindBindings = new WeakMap<Element, BindConfig>();
  private ifBindings = new WeakMap<Element, string>();
  private showBindings = new WeakMap<Element, string>();
  private htmlBindings = new WeakMap<Element, { expr: string; trusted: boolean }>();
  private getBindings = new WeakMap<Element, GetConfig>();

  async mount(root: HTMLElement): Promise<void> {
    const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      if (!this.hasVsnAttributes(element)) {
        continue;
      }
      const parentScope = this.findParentScope(element);
      this.getScope(element, parentScope);
      this.attachAttributes(element);
    }
  }

  getScope(element: Element, parentScope?: Scope): Scope {
    const existing = this.scopes.get(element);
    if (existing) {
      return existing;
    }
    const scope = new Scope(parentScope ?? this.findParentScope(element));
    this.scopes.set(element, scope);
    return scope;
  }

  evaluate(element: Element): void {
    const scope = this.getScope(element);
    const bindConfig = this.bindBindings.get(element);
    if (bindConfig && (bindConfig.direction === "from" || bindConfig.direction === "both")) {
      applyBindToElement(element, bindConfig.expr, scope);
    }
    const ifExpr = this.ifBindings.get(element);
    if (ifExpr && element instanceof HTMLElement) {
      applyIf(element, ifExpr, scope);
    }
    const showExpr = this.showBindings.get(element);
    if (showExpr && element instanceof HTMLElement) {
      applyShow(element, showExpr, scope);
    }
    const htmlBinding = this.htmlBindings.get(element);
    if (htmlBinding && element instanceof HTMLElement) {
      applyHtml(element, htmlBinding.expr, scope, htmlBinding.trusted);
    }
  }

  private attachAttributes(element: Element): void {
    const scope = this.getScope(element);
    for (const name of element.getAttributeNames()) {
      if (name.startsWith("vsn-bind")) {
        const value = element.getAttribute(name) ?? "";
        const direction = this.parseBindDirection(name);
        this.bindBindings.set(element, { expr: value, direction });
        if (direction === "to" || direction === "both") {
          applyBindToScope(element, value, scope);
        }
        continue;
      }

      if (name === "vsn-if") {
        const value = element.getAttribute(name) ?? "";
        this.ifBindings.set(element, value);
        if (element instanceof HTMLElement) {
          applyIf(element, value, scope);
        }
        continue;
      }

      if (name === "vsn-show") {
        const value = element.getAttribute(name) ?? "";
        this.showBindings.set(element, value);
        if (element instanceof HTMLElement) {
          applyShow(element, value, scope);
        }
        continue;
      }

      if (name.startsWith("vsn-html")) {
        const trusted = name.includes("!trusted");
        const value = element.getAttribute(name) ?? "";
        this.htmlBindings.set(element, { expr: value, trusted });
        if (element instanceof HTMLElement) {
          applyHtml(element, value, scope, trusted);
        }
        continue;
      }

      if (name.startsWith("vsn-get")) {
        const trusted = name.includes("!trusted");
        const url = element.getAttribute(name) ?? "";
        const target = element.getAttribute("vsn-target") ?? undefined;
        const swap = (element.getAttribute("vsn-swap") as "inner" | "outer" | null) ?? "inner";
        const config: GetConfig = {
          url,
          swap,
          trusted,
          ...(target ? { targetSelector: target } : {})
        };
        this.getBindings.set(element, config);
        this.attachGetHandler(element);
        continue;
      }

      const onConfig = this.parseOnAttribute(name, element.getAttribute(name) ?? "");
      if (onConfig) {
        this.attachOnHandler(element, onConfig);
      }
    }
  }

  private parseBindDirection(name: string): BindDirection {
    if (name.includes(":from")) {
      return "from";
    }
    if (name.includes(":to")) {
      return "to";
    }
    return "both";
  }

  private hasVsnAttributes(element: Element): boolean {
    return element.getAttributeNames().some((name) => name.startsWith("vsn-"));
  }

  private findParentScope(element: Element): Scope | undefined {
    let parent = element.parentElement;
    while (parent) {
      const scope = this.scopes.get(parent);
      if (scope) {
        return scope;
      }
      parent = parent.parentElement;
    }
    return undefined;
  }

  private parseOnAttribute(name: string, value: string): OnConfig | null {
    if (!name.startsWith("vsn-on:")) {
      return null;
    }

    const eventWithFlags = name.slice("vsn-on:".length);
    const [event, ...flags] = eventWithFlags.split("!");
    if (!event) {
      return null;
    }

    let debounceMs: number | undefined;
    for (const flag of flags) {
      if (!flag.startsWith("debounce")) {
        continue;
      }
      const match = flag.match(/debounce\((\d+)\)/);
      debounceMs = match ? Number(match[1]) : 200;
    }

    const config: OnConfig = {
      event,
      code: value,
      ...(debounceMs !== undefined ? { debounceMs } : {})
    };
    return config;
  }

  private attachOnHandler(element: Element, config: OnConfig): void {
    const handler = () => {
      const scope = this.getScope(element);
      this.execute(config.code, scope);
      this.evaluate(element);
    };
    const effectiveHandler = config.debounceMs ? debounce(handler, config.debounceMs) : handler;
    element.addEventListener(config.event, effectiveHandler);
  }

  private attachGetHandler(element: Element): void {
    element.addEventListener("click", async () => {
      const config = this.getBindings.get(element);
      if (!config) {
        return;
      }
      await applyGet(element, config, this.getScope(element));
    });
  }

  private execute(code: string, scope: Scope): void {
    const statements = code.split(";").map((s) => s.trim()).filter(Boolean);
    for (const statement of statements) {
      const assignmentMatch = statement.match(/^([_a-zA-Z][_a-zA-Z0-9.]+)\s*=\s*(.+)$/);
      if (assignmentMatch) {
        const target = assignmentMatch[1];
        const expr = assignmentMatch[2];
        if (!target || !expr) {
          continue;
        }
        const value = this.evaluateExpression(expr, scope);
        scope.setPath(target, value);
        continue;
      }
      this.evaluateExpression(statement, scope);
    }
  }

  private evaluateExpression(expr: string, scope: Scope): any {
    const parts = expr.split("+").map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts.reduce((sum, part) => {
        const value = this.evaluateExpression(part, scope);
        return (sum as any) + (value as any);
      }, 0 as any);
    }

    const token = parts[0];
    if (!token) {
      return undefined;
    }
    if (token === "true") return true;
    if (token === "false") return false;
    if (token === "null") return null;
    if (/^-?\d+(?:\.\d+)?$/.test(token)) {
      return Number(token);
    }
    if ((token.startsWith("\"") && token.endsWith("\"")) || (token.startsWith("'") && token.endsWith("'"))) {
      return token.slice(1, -1);
    }
    return scope.getPath(token);
  }
}
