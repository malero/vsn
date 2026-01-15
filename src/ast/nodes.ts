export interface ExecutionContext {
  scope?: {
    getPath(key: string): any;
    setPath?(key: string, value: any): void;
  };
  globals?: Record<string, any>;
  element?: Element;
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
  constructor(public behaviors: BehaviorNode[]) {
    super("Program");
  }
}

export class BlockNode extends BaseNode {
  constructor(public statements: CFSNode[]) {
    super("Block");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    for (const statement of this.statements) {
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
    public body: BlockNode
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

export interface DeclarationFlags {
  important?: boolean;
  trusted?: boolean;
  debounce?: boolean;
}

export interface DeclarationFlagArgs {
  debounce?: number;
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
  | CallExpression
  | DirectiveExpression
  | QueryExpression;

export type DeclarationTarget = IdentifierExpression | DirectiveExpression;
export type AssignmentTarget = IdentifierExpression | DirectiveExpression;

export class IdentifierExpression extends BaseNode {
  constructor(public name: string) {
    super("Identifier");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    if (!context.scope) {
      return undefined;
    }
    return context.scope.getPath(this.name);
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
    const left = await this.left.evaluate(context);
    const right = await this.right.evaluate(context);
    if (this.operator === "+") {
      return (left as any) + (right as any);
    }
    if (this.operator === "-") {
      return (left as any) - (right as any);
    }
    return undefined;
  }
}

export class CallExpression extends BaseNode {
  constructor(public callee: ExpressionNode, public args: ExpressionNode[]) {
    super("CallExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const resolved = this.resolveCallee(context);
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

  private resolveCallee(
    context: ExecutionContext
  ): { fn: any; thisArg?: any } | undefined {
    if (!(this.callee instanceof IdentifierExpression)) {
      return undefined;
    }
    const name = this.callee.name;
    const globals = context.globals ?? {};
    const parts = name.split(".");
    const root = parts[0];
    if (!root || !(root in globals)) {
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

export class DirectiveExpression extends BaseNode {
  constructor(public kind: "attr" | "style", public name: string) {
    super("Directive");
  }

  async evaluate(): Promise<any> {
    return `${this.kind}:${this.name}`;
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
      : context.element ?? (typeof document !== "undefined" ? document : undefined);
    if (!root || !("querySelectorAll" in root)) {
      return [];
    }
    return Array.from((root as ParentNode).querySelectorAll(selector));
  }
}
