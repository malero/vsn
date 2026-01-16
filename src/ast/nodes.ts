export interface ExecutionContext {
  scope?: {
    getPath(key: string): any;
    setPath?(key: string, value: any): void;
    hasKey?(key: string): boolean;
  };
  globals?: Record<string, any>;
  element?: Element;
  returnValue?: any;
  returning?: boolean;
}

export interface CFSNode {
  type: string;
  prepare(context: ExecutionContext): Promise<void>;
  evaluate(context: ExecutionContext): Promise<any>;
}

export abstract class BaseNode implements CFSNode {
  constructor(public type: string) {}

  async prepare(_context: ExecutionContext): Promise<void> {
    return;
  }

  async evaluate(_context: ExecutionContext): Promise<any> {
    return undefined;
  }
}

export class ProgramNode extends BaseNode {
  constructor(public behaviors: BehaviorNode[], public uses: UseNode[] = []) {
    super("Program");
  }
}

export class UseNode extends BaseNode {
  constructor(public name: string, public alias: string) {
    super("Use");
  }
}

export class BlockNode extends BaseNode {
  constructor(public statements: CFSNode[]) {
    super("Block");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    for (const statement of this.statements) {
      if (context.returning) {
        break;
      }
      if (statement && typeof statement.evaluate === "function") {
        await statement.evaluate(context);
      }
    }
  }
}

export class SelectorNode extends BaseNode {
  constructor(public selectorText: string) {
    super("Selector");
  }
}

export class BehaviorNode extends BaseNode {
  constructor(public selector: SelectorNode, public body: BlockNode) {
    super("Behavior");
  }
}

export class StateEntryNode extends BaseNode {
  constructor(
    public name: string,
    public value: ExpressionNode,
    public important: boolean
  ) {
    super("StateEntry");
  }
}

export class StateBlockNode extends BaseNode {
  constructor(public entries: StateEntryNode[]) {
    super("StateBlock");
  }
}

export class OnBlockNode extends BaseNode {
  constructor(
    public eventName: string,
    public args: string[],
    public body: BlockNode,
    public modifiers: string[] = []
  ) {
    super("OnBlock");
  }
}

export class AssignmentNode extends BaseNode {
  constructor(public target: AssignmentTarget, public value: ExpressionNode) {
    super("Assignment");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    if (!context.scope || !context.scope.setPath) {
      return undefined;
    }
    let targetPath: string | undefined;
    if (this.target instanceof IdentifierExpression) {
      targetPath = this.target.name;
    }
    if (!targetPath) {
      return undefined;
    }
    const value = await this.value.evaluate(context);
    context.scope.setPath(targetPath, value);
    return value;
  }
}

export class ReturnNode extends BaseNode {
  constructor(public value?: ExpressionNode) {
    super("Return");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    if (context.returning) {
      return context.returnValue;
    }
    context.returnValue = this.value ? await this.value.evaluate(context) : undefined;
    context.returning = true;
    return context.returnValue;
  }
}

export class FunctionDeclarationNode extends BaseNode {
  constructor(
    public name: string,
    public params: string[],
    public body: BlockNode,
    public isAsync = false
  ) {
    super("FunctionDeclaration");
  }
}

export class FunctionExpression extends BaseNode {
  constructor(
    public params: string[],
    public body: BlockNode,
    public isAsync = false
  ) {
    super("FunctionExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const scope = context.scope;
    const globals = context.globals;
    const element = context.element;
    return async (...args: any[]) => {
      const inner: ExecutionContext = {
        ...(scope ? { scope } : {}),
        ...(globals ? { globals } : {}),
        ...(element ? { element } : {}),
        returnValue: undefined,
        returning: false
      };
      if (scope) {
        const previousValues = new Map<string, any>();
        for (let i = 0; i < this.params.length; i += 1) {
          const name = this.params[i];
          if (!name) {
            continue;
          }
          previousValues.set(name, scope.getPath(name));
          if (scope.setPath) {
            scope.setPath(name, args[i]);
          }
        }
        await this.body.evaluate(inner);
        for (const name of this.params) {
          if (!name || !scope.setPath) {
            continue;
          }
          scope.setPath(name, previousValues.get(name));
        }
      } else {
        await this.body.evaluate(inner);
      }
      return inner.returnValue;
    };
  }
}

export interface DeclarationFlags {
  important?: boolean;
  trusted?: boolean;
  debounce?: boolean;
  [key: string]: boolean | undefined;
}

export interface DeclarationFlagArgs {
  debounce?: number;
  [key: string]: any;
}

export class DeclarationNode extends BaseNode {
  constructor(
    public target: DeclarationTarget,
    public operator: ":" | ":=" | ":<" | ":>",
    public value: ExpressionNode,
    public flags: DeclarationFlags,
    public flagArgs: DeclarationFlagArgs
  ) {
    super("Declaration");
  }
}

export type ExpressionNode =
  | IdentifierExpression
  | LiteralExpression
  | UnaryExpression
  | BinaryExpression
  | MemberExpression
  | CallExpression
  | ArrayExpression
  | IndexExpression
  | FunctionExpression
  | AwaitExpression
  | TernaryExpression
  | DirectiveExpression
  | QueryExpression;

export type DeclarationTarget = IdentifierExpression | DirectiveExpression;
export type AssignmentTarget = IdentifierExpression | DirectiveExpression;

export class IdentifierExpression extends BaseNode {
  constructor(public name: string) {
    super("Identifier");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    if (context.scope) {
      const value = context.scope.getPath(this.name);
      const root = this.name.split(".")[0];
      const explicit = this.name.startsWith("parent.")
        || this.name.startsWith("root.")
        || this.name.startsWith("self.");
      if (explicit || value !== undefined || (root && context.scope.hasKey?.(root))) {
        return value;
      }
    }
    return context.globals ? context.globals[this.name] : undefined;
  }
}

export class LiteralExpression extends BaseNode {
  constructor(public value: string | number | boolean | null) {
    super("Literal");
  }

  async evaluate(): Promise<any> {
    return this.value;
  }
}

export class UnaryExpression extends BaseNode {
  constructor(public operator: string, public argument: ExpressionNode) {
    super("UnaryExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const value = await this.argument.evaluate(context);
    if (this.operator === "!") {
      return !value;
    }
    if (this.operator === "-") {
      return -(value as any);
    }
    return value;
  }
}

export class BinaryExpression extends BaseNode {
  constructor(
    public operator: string,
    public left: ExpressionNode,
    public right: ExpressionNode
  ) {
    super("BinaryExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    if (this.operator === "&&") {
      const leftValue = await this.left.evaluate(context);
      return leftValue && (await this.right.evaluate(context));
    }
    if (this.operator === "||") {
      const leftValue = await this.left.evaluate(context);
      return leftValue || (await this.right.evaluate(context));
    }
    const left = await this.left.evaluate(context);
    const right = await this.right.evaluate(context);
    if (this.operator === "+") {
      return (left as any) + (right as any);
    }
    if (this.operator === "-") {
      return (left as any) - (right as any);
    }
    if (this.operator === "==") {
      return left == right;
    }
    if (this.operator === "!=") {
      return left != right;
    }
    if (this.operator === "<") {
      return (left as any) < (right as any);
    }
    if (this.operator === ">") {
      return (left as any) > (right as any);
    }
    if (this.operator === "<=") {
      return (left as any) <= (right as any);
    }
    if (this.operator === ">=") {
      return (left as any) >= (right as any);
    }
    return undefined;
  }
}

export class TernaryExpression extends BaseNode {
  constructor(
    public test: ExpressionNode,
    public consequent: ExpressionNode,
    public alternate: ExpressionNode
  ) {
    super("TernaryExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const condition = await this.test.evaluate(context);
    if (condition) {
      return this.consequent.evaluate(context);
    }
    return this.alternate.evaluate(context);
  }
}

export class MemberExpression extends BaseNode {
  constructor(public target: ExpressionNode, public property: string) {
    super("MemberExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const resolved = await this.resolve(context);
    return resolved?.value;
  }

  async resolve(
    context: ExecutionContext
  ): Promise<{ value: any; target?: any } | undefined> {
    const path = this.getIdentifierPath();
    if (path) {
      const resolved = this.resolveFromScope(context, path);
      if (resolved) {
        return resolved;
      }
      const resolvedGlobal = this.resolveFromGlobals(context, path);
      if (resolvedGlobal) {
        return resolvedGlobal;
      }
    }

    const target = await this.target.evaluate(context);
    if (target == null) {
      return { value: undefined, target };
    }
    return { value: (target as any)[this.property], target };
  }

  getIdentifierPath(): { path: string; root: string } | undefined {
    const targetPath = this.getTargetIdentifierPath();
    if (!targetPath) {
      return undefined;
    }
    const path = `${targetPath.path}.${this.property}`;
    return { path, root: targetPath.root };
  }

  private getTargetIdentifierPath(): { path: string; root: string } | undefined {
    if (this.target instanceof IdentifierExpression) {
      const name = this.target.name;
      const root = name.split(".")[0];
      if (!root) {
        return undefined;
      }
      return { path: name, root };
    }
    if (this.target instanceof MemberExpression) {
      return this.target.getIdentifierPath();
    }
    return undefined;
  }

  private resolveFromScope(
    context: ExecutionContext,
    path: { path: string; root: string }
  ): { value: any; target?: any } | undefined {
    if (!context.scope) {
      return undefined;
    }
    const value = context.scope.getPath(path.path);
    const explicit = path.path.startsWith("parent.")
      || path.path.startsWith("root.")
      || path.path.startsWith("self.");
    if (!explicit && value === undefined && !context.scope.hasKey?.(path.root)) {
      return undefined;
    }
    const targetPath = this.getTargetPath(path.path);
    const target = targetPath ? context.scope.getPath(targetPath) : undefined;
    return { value, target };
  }

  private resolveFromGlobals(
    context: ExecutionContext,
    path: { path: string; root: string }
  ): { value: any; target?: any } | undefined {
    const globals = context.globals ?? {};
    if (!path.root || !(path.root in globals)) {
      return undefined;
    }
    let value = globals[path.root];
    let parent: any = undefined;
    const parts = path.path.split(".");
    for (let i = 1; i < parts.length; i += 1) {
      parent = value;
      const part = parts[i];
      if (!part) {
        return { value: undefined, target: parent };
      }
      value = value?.[part];
    }
    return { value, target: parent };
  }

  private getTargetPath(path: string): string | undefined {
    const parts = path.split(".");
    if (parts.length <= 1) {
      return undefined;
    }
    return parts.slice(0, -1).join(".");
  }
}

export class CallExpression extends BaseNode {
  constructor(public callee: ExpressionNode, public args: ExpressionNode[]) {
    super("CallExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const resolved = await this.resolveCallee(context);
    const fn = resolved?.fn ?? (await this.callee.evaluate(context));
    if (typeof fn !== "function") {
      return undefined;
    }
    const values = [];
    for (const arg of this.args) {
      values.push(await arg.evaluate(context));
    }
    return fn.apply(resolved?.thisArg, values);
  }

  private async resolveCallee(
    context: ExecutionContext
  ): Promise<{ fn: any; thisArg?: any } | undefined> {
    if (this.callee instanceof MemberExpression) {
      const resolved = await this.callee.resolve(context);
      if (!resolved) {
        return undefined;
      }
      return { fn: resolved.value, thisArg: resolved.target };
    }
    if (!(this.callee instanceof IdentifierExpression)) {
      return undefined;
    }
    const name = this.callee.name;
    const globals = context.globals ?? {};
    const parts = name.split(".");
    const root = parts[0];
    if (!root || !(root in globals)) {
      if (parts.length > 1 && context.scope) {
        const parentPath = parts.slice(0, -1).join(".");
        const methodName = parts[parts.length - 1];
        if (!methodName) {
          return undefined;
        }
        const parentValue = context.scope.getPath(parentPath);
        if (parentValue == null) {
          return undefined;
        }
        return { fn: parentValue?.[methodName], thisArg: parentValue };
      }
      return undefined;
    }
    let value = globals[root];
    let parent: any = undefined;
    for (let i = 1; i < parts.length; i += 1) {
      parent = value;
      const part = parts[i];
      if (!part) {
        return undefined;
      }
      value = value?.[part];
    }
    return { fn: value, thisArg: parent };
  }
}

export class ArrayExpression extends BaseNode {
  constructor(public elements: ExpressionNode[]) {
    super("ArrayExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const values: any[] = [];
    for (const element of this.elements) {
      values.push(await element.evaluate(context));
    }
    return values;
  }
}

export class IndexExpression extends BaseNode {
  constructor(public target: ExpressionNode, public index: ExpressionNode) {
    super("IndexExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const target = await this.target.evaluate(context);
    if (target == null) {
      return undefined;
    }
    const index = await this.index.evaluate(context);
    if (index == null) {
      return undefined;
    }
    return (target as any)[index as any];
  }
}

export class DirectiveExpression extends BaseNode {
  constructor(public kind: "attr" | "style", public name: string) {
    super("Directive");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const element = context.element;
    if (!element) {
      return `${this.kind}:${this.name}`;
    }
    if (this.kind === "attr") {
      if (this.name === "value") {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          return element.value;
        }
        if (element instanceof HTMLSelectElement) {
          return element.value;
        }
      }
      if (this.name === "checked" && element instanceof HTMLInputElement) {
        return element.checked;
      }
      if (this.name === "html" && element instanceof HTMLElement) {
        return element.innerHTML;
      }
      return element.getAttribute(this.name) ?? undefined;
    }
    if (this.kind === "style" && element instanceof HTMLElement) {
      return element.style.getPropertyValue(this.name) ?? undefined;
    }
    return undefined;
  }
}

export class AwaitExpression extends BaseNode {
  constructor(public argument: ExpressionNode) {
    super("AwaitExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const value = await this.argument.evaluate(context);
    return await value;
  }
}

export class QueryExpression extends BaseNode {
  constructor(public direction: "self" | "descendant" | "ancestor", public selector: string) {
    super("Query");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const selector = this.selector.trim();
    if (!selector) {
      return [];
    }
    if (this.direction === "ancestor") {
      const results: Element[] = [];
      let cursor = context.element?.parentElement;
      while (cursor) {
        if (cursor.matches(selector)) {
          results.push(cursor);
        }
        cursor = cursor.parentElement;
      }
      return results;
    }
    const root = this.direction === "descendant"
      ? context.element ?? (typeof document !== "undefined" ? document : undefined)
      : (typeof document !== "undefined" ? document : undefined);
    if (!root || !("querySelectorAll" in root)) {
      return [];
    }
    return Array.from((root as ParentNode).querySelectorAll(selector));
  }
}
