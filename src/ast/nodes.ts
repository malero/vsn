export interface ExecutionContext {
  // Placeholder for runtime context
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
  constructor(public target: string, public value: ExpressionNode) {
    super("Assignment");
  }
}

export type ExpressionNode =
  | IdentifierExpression
  | LiteralExpression
  | UnaryExpression
  | DirectiveExpression
  | QueryExpression;

export class IdentifierExpression extends BaseNode {
  constructor(public name: string) {
    super("Identifier");
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
}

export class DirectiveExpression extends BaseNode {
  constructor(public kind: "attr" | "style", public name: string) {
    super("Directive");
  }
}

export class QueryExpression extends BaseNode {
  constructor(public direction: "self" | "descendant" | "ancestor", public selector: string) {
    super("Query");
  }
}
