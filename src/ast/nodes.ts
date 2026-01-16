export interface ExecutionContext {
  scope?: {
    getPath(key: string): any;
    setPath?(key: string, value: any): void;
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
  constructor(public name: string, public params: string[], public body: BlockNode) {
    super("FunctionDeclaration");
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
  | ArrayExpression
  | IndexExpression
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
      : (typeof document !== "undefined" ? document : undefined);
    if (!root || !("querySelectorAll" in root)) {
      return [];
    }
    return Array.from((root as ParentNode).querySelectorAll(selector));
  }
}
