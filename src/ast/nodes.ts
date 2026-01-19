export interface ExecutionContext {
  scope: {
    getPath(key: string): any;
    setPath?(key: string, value: any): void;
    hasKey?(key: string): boolean;
    createChild?(): ExecutionContext["scope"];
  } | undefined;
  rootScope: ExecutionContext["scope"];
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

async function evaluateWithChildScope(context: ExecutionContext, block: BlockNode): Promise<any> {
  const scope = context.scope;
  if (!scope || !scope.createChild) {
    return block.evaluate(context);
  }
  const previousScope = context.scope;
  context.scope = scope.createChild();
  try {
    return await block.evaluate(context);
  } finally {
    context.scope = previousScope;
  }
}

export class ProgramNode extends BaseNode {
  constructor(public behaviors: BehaviorNode[], public uses: UseNode[] = []) {
    super("Program");
  }
}

export interface UseFlags {
  wait?: boolean;
}

export interface UseFlagArgs {
  wait?: { timeoutMs?: number; intervalMs?: number };
}

export class UseNode extends BaseNode {
  constructor(
    public name: string,
    public alias: string,
    public flags: UseFlags = {},
    public flagArgs: UseFlagArgs = {}
  ) {
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
  constructor(
    public target: AssignmentTarget,
    public value: ExpressionNode,
    public operator: "=" | "+=" | "-=" | "*=" | "/=" = "="
  ) {
    super("Assignment");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    if (!context.scope || !context.scope.setPath) {
      return undefined;
    }
    const value = await this.value.evaluate(context);
    if (this.operator !== "=") {
      return await this.applyCompoundAssignment(context, value);
    }
    if (this.target instanceof IdentifierExpression && this.target.name.startsWith("root.") && context.rootScope) {
      const path = this.target.name.slice("root.".length);
      context.rootScope.setPath?.(`self.${path}`, value);
      return value;
    }
    if (this.target instanceof MemberExpression || this.target instanceof IndexExpression) {
      const resolved = await this.resolveAssignmentTarget(context);
      if (resolved?.scope?.setPath) {
        resolved.scope.setPath(resolved.path, value);
        return value;
      }
    }
    this.assignTarget(context, this.target, value);
    return value;
  }

  private async applyCompoundAssignment(context: ExecutionContext, value: any): Promise<any> {
    if (!context.scope || !context.scope.setPath) {
      return undefined;
    }
    const resolved = await this.resolveAssignmentTarget(context);
    if (!resolved) {
      throw new Error("Compound assignment requires a simple identifier or member path");
    }
    const { scope, path } = resolved;
    const current = scope?.getPath ? scope.getPath(path) : undefined;
    let result: any;
    if (this.operator === "+=") {
      result = current + value;
    } else if (this.operator === "-=") {
      result = current - value;
    } else if (this.operator === "*=") {
      result = current * value;
    } else {
      result = current / value;
    }
    scope?.setPath?.(path, result);
    return result;
  }

  private async resolveAssignmentTarget(
    context: ExecutionContext
  ): Promise<{ scope: ExecutionContext["scope"]; path: string } | null> {
    if (this.target instanceof IdentifierExpression) {
      const isRoot = this.target.name.startsWith("root.");
      const rawPath = isRoot ? this.target.name.slice("root.".length) : this.target.name;
      if (isRoot) {
        if (context.rootScope) {
          return { scope: context.rootScope, path: `self.${rawPath}` };
        }
        return { scope: context.scope, path: `root.${rawPath}` };
      }
      return { scope: context.scope, path: rawPath };
    }
    if (this.target instanceof MemberExpression) {
      const resolvedPath = this.target.getIdentifierPath();
      if (!resolvedPath) {
        return null;
      }
      const path = resolvedPath.path;
      const isRoot = path.startsWith("root.");
      const rawPath = isRoot ? path.slice("root.".length) : path;
      if (isRoot) {
        if (context.rootScope) {
          return { scope: context.rootScope, path: `self.${rawPath}` };
        }
        return { scope: context.scope, path: `root.${rawPath}` };
      }
      return { scope: context.scope, path: rawPath };
    }
    if (this.target instanceof IndexExpression) {
      const path = await this.resolveIndexPath(context, this.target);
      if (!path) {
        return null;
      }
      const isRoot = path.startsWith("root.");
      const rawPath = isRoot ? path.slice("root.".length) : path;
      if (isRoot) {
        if (context.rootScope) {
          return { scope: context.rootScope, path: `self.${rawPath}` };
        }
        return { scope: context.scope, path: `root.${rawPath}` };
      }
      return { scope: context.scope, path: rawPath };
    }
    return null;
  }

  private async resolveIndexPath(context: ExecutionContext, expr: IndexExpression): Promise<string | null> {
    const base = await this.resolveTargetPath(context, expr.target);
    if (!base) {
      return null;
    }
    const indexValue = await expr.index.evaluate(context);
    if (indexValue == null) {
      return null;
    }
    return `${base}.${indexValue}`;
  }

  private async resolveTargetPath(context: ExecutionContext, target: ExpressionNode): Promise<string | null> {
    if (target instanceof IdentifierExpression) {
      return target.name;
    }
    if (target instanceof MemberExpression) {
      return target.getIdentifierPath()?.path ?? null;
    }
    if (target instanceof IndexExpression) {
      return this.resolveIndexPath(context, target);
    }
    return null;
  }

  private assignTarget(context: ExecutionContext, target: AssignmentTarget, value: any): void {
    if (!context.scope || !context.scope.setPath) {
      return;
    }
    if (target instanceof DirectiveExpression) {
      this.assignDirectiveTarget(context, target, value);
      return;
    }
    if (target instanceof IdentifierExpression) {
      context.scope.setPath(target.name, value);
      return;
    }
    if (target instanceof ArrayPattern) {
      const source = Array.isArray(value) ? value : [];
      let index = 0;
      for (const element of target.elements) {
        if (element instanceof RestElement) {
          context.scope.setPath(element.target.name, source.slice(index));
          return;
        }
        if (element === null) {
          index += 1;
          continue;
        }
        this.assignTarget(context, element, source[index]);
        index += 1;
      }
      return;
    }
    if (target instanceof ObjectPattern) {
      const source = value && typeof value === "object" ? value : {};
      const usedKeys = new Set<string>();
      for (const entry of target.entries) {
        if ("rest" in entry) {
          const rest: Record<string, any> = {};
          for (const key of Object.keys(source)) {
            if (!usedKeys.has(key)) {
              rest[key] = (source as any)[key];
            }
          }
          context.scope.setPath(entry.rest.name, rest);
          continue;
        }
        usedKeys.add(entry.key);
        this.assignTarget(context, entry.target, (source as any)[entry.key]);
      }
      return;
    }
  }

  private assignDirectiveTarget(
    context: ExecutionContext,
    target: DirectiveExpression,
    value: any
  ): void {
    const element = context.element;
    if (!element) {
      return;
    }
    if (target.kind === "attr") {
      if (target.name === "value") {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.value = value == null ? "" : String(value);
          element.setAttribute("value", element.value);
          return;
        }
        if (element instanceof HTMLSelectElement) {
          element.value = value == null ? "" : String(value);
          return;
        }
      }
      if (target.name === "checked" && element instanceof HTMLInputElement) {
        const checked = value === true || value === "true" || value === 1 || value === "1";
        element.checked = checked;
        if (checked) {
          element.setAttribute("checked", "");
        } else {
          element.removeAttribute("checked");
        }
        return;
      }
      if (target.name === "html" && element instanceof HTMLElement) {
        element.innerHTML = value == null ? "" : String(value);
        return;
      }
      element.setAttribute(target.name, value == null ? "" : String(value));
      return;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      element.style.setProperty(target.name, value == null ? "" : String(value));
    }
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

export class IfNode extends BaseNode {
  constructor(
    public test: ExpressionNode,
    public consequent: BlockNode,
    public alternate?: BlockNode
  ) {
    super("If");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const condition = await this.test.evaluate(context);
    if (condition) {
      return evaluateWithChildScope(context, this.consequent);
    }
    if (this.alternate) {
      return evaluateWithChildScope(context, this.alternate);
    }
  }
}

export class WhileNode extends BaseNode {
  constructor(public test: ExpressionNode, public body: BlockNode) {
    super("While");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const previousScope = context.scope;
    if (context.scope?.createChild) {
      context.scope = context.scope.createChild();
    }
    try {
      while (await this.test.evaluate(context)) {
        await this.body.evaluate(context);
        if (context.returning) {
          break;
        }
      }
    } finally {
      context.scope = previousScope;
    }
  }
}

export class ForNode extends BaseNode {
  constructor(
    public init: CFSNode | undefined,
    public test: ExpressionNode | undefined,
    public update: CFSNode | undefined,
    public body: BlockNode
  ) {
    super("For");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    if (this.init) {
      await this.init.evaluate(context);
    }
    const previousScope = context.scope;
    let bodyScope = context.scope;
    if (context.scope?.createChild) {
      bodyScope = context.scope.createChild();
    }
    while (this.test ? await this.test.evaluate(context) : true) {
      context.scope = bodyScope;
      await this.body.evaluate(context);
      if (context.returning) {
        break;
      }
      context.scope = previousScope;
      if (this.update) {
        await this.update.evaluate(context);
      }
    }
    context.scope = previousScope;
  }
}

export class TryNode extends BaseNode {
  constructor(
    public body: BlockNode,
    public errorName: string,
    public handler: BlockNode
  ) {
    super("Try");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    try {
      return await evaluateWithChildScope(context, this.body);
    } catch (error) {
      if (context.returning) {
        return context.returnValue;
      }
      const previousScope = context.scope;
      let handlerScope = context.scope;
      if (context.scope?.createChild) {
        handlerScope = context.scope.createChild();
      }
      context.scope = handlerScope;
      const scope = context.scope;
      let previous: any = undefined;
      if (scope) {
        previous = scope.getPath(this.errorName);
        if (scope.setPath) {
          scope.setPath(`self.${this.errorName}`, error);
        }
      }
      await this.handler.evaluate(context);
      if (scope && scope.setPath && handlerScope === previousScope) {
        scope.setPath(this.errorName, previous);
      }
      context.scope = previousScope;
    }
  }
}

export class FunctionDeclarationNode extends BaseNode {
  constructor(
    public name: string,
    public params: FunctionParam[],
    public body: BlockNode,
    public isAsync = false
  ) {
    super("FunctionDeclaration");
  }
}

export class FunctionExpression extends BaseNode {
  constructor(
    public params: FunctionParam[],
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
      const activeScope = scope?.createChild ? scope.createChild() : scope;
      const inner: ExecutionContext = {
        scope: activeScope,
        rootScope: context.rootScope,
        ...(globals ? { globals } : {}),
        ...(element ? { element } : {}),
        returnValue: undefined,
        returning: false
      };
      if (activeScope) {
        const previousValues = new Map<string, any>();
        await this.applyParams(activeScope, previousValues, inner, args);
        await this.body.evaluate(inner);
        if (activeScope === scope) {
          this.restoreParams(activeScope, previousValues);
        }
      } else {
        await this.body.evaluate(inner);
      }
      return inner.returnValue;
    };
  }

  private async applyParams(
    scope: ExecutionContext["scope"],
    previousValues: Map<string, any>,
    context: ExecutionContext,
    args: any[]
  ): Promise<void> {
    if (!scope || !scope.setPath) {
      return;
    }
    let argIndex = 0;
    for (const param of this.params) {
      const name = param.name;
      if (!name) {
        continue;
      }
      previousValues.set(name, scope.getPath(name));
      if (param.rest) {
        scope.setPath(`self.${name}`, args.slice(argIndex));
        argIndex = args.length;
        continue;
      }
      let value = args[argIndex];
      if (value === undefined && param.defaultValue) {
        value = await param.defaultValue.evaluate(context);
      }
      scope.setPath(`self.${name}`, value);
      argIndex += 1;
    }
  }

  private restoreParams(scope: ExecutionContext["scope"], previousValues: Map<string, any>): void {
    if (!scope || !scope.setPath) {
      return;
    }
    for (const param of this.params) {
      const name = param.name;
      if (!name) {
        continue;
      }
      scope.setPath(name, previousValues.get(name));
    }
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
  | TemplateExpression
  | UnaryExpression
  | BinaryExpression
  | MemberExpression
  | CallExpression
  | ArrayExpression
  | ObjectExpression
  | IndexExpression
  | FunctionExpression
  | AwaitExpression
  | TernaryExpression
  | DirectiveExpression
  | QueryExpression;

export type DeclarationTarget = IdentifierExpression | DirectiveExpression;
export type AssignmentTarget =
  | IdentifierExpression
  | MemberExpression
  | IndexExpression
  | DirectiveExpression
  | ArrayPattern
  | ObjectPattern;

export type FunctionParam = {
  name: string;
  defaultValue?: ExpressionNode;
  rest?: boolean;
};

export type PatternNode = IdentifierExpression | ArrayPattern | ObjectPattern;

export class IdentifierExpression extends BaseNode {
  constructor(public name: string) {
    super("Identifier");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    if (this.name.startsWith("root.") && context.rootScope) {
      const path = this.name.slice("root.".length);
      return context.rootScope.getPath(`self.${path}`);
    }
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

export class SpreadElement extends BaseNode {
  constructor(public value: ExpressionNode) {
    super("SpreadElement");
  }
}

export class RestElement extends BaseNode {
  constructor(public target: IdentifierExpression) {
    super("RestElement");
  }
}

export type ArrayPatternElement = PatternNode | RestElement | null;

export class ArrayPattern extends BaseNode {
  constructor(public elements: ArrayPatternElement[]) {
    super("ArrayPattern");
  }
}

export type ObjectPatternEntry =
  | { key: string; target: PatternNode }
  | { rest: IdentifierExpression };

export class ObjectPattern extends BaseNode {
  constructor(public entries: ObjectPatternEntry[]) {
    super("ObjectPattern");
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

export class TemplateExpression extends BaseNode {
  constructor(public parts: ExpressionNode[]) {
    super("TemplateExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    let result = "";
    for (const part of this.parts) {
      const value = await part.evaluate(context);
      result += value == null ? "" : String(value);
    }
    return result;
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
    if (this.operator === "??") {
      const leftValue = await this.left.evaluate(context);
      return leftValue ?? (await this.right.evaluate(context));
    }
    const left = await this.left.evaluate(context);
    const right = await this.right.evaluate(context);
    if (this.operator === "+") {
      return (left as any) + (right as any);
    }
    if (this.operator === "-") {
      return (left as any) - (right as any);
    }
    if (this.operator === "*") {
      return (left as any) * (right as any);
    }
    if (this.operator === "/") {
      return (left as any) / (right as any);
    }
    if (this.operator === "%") {
      return (left as any) % (right as any);
    }
    if (this.operator === "==") {
      return left == right;
    }
    if (this.operator === "!=") {
      return left != right;
    }
    if (this.operator === "===") {
      return left === right;
    }
    if (this.operator === "!==") {
      return left !== right;
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
  constructor(
    public target: ExpressionNode,
    public property: string,
    public optional = false
  ) {
    super("MemberExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const resolved = await this.resolve(context);
    return resolved?.value;
  }

  async resolve(
    context: ExecutionContext
  ): Promise<{ value: any; target?: any; optional?: boolean } | undefined> {
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
      return { value: undefined, target, optional: this.optional };
    }
    return { value: (target as any)[this.property], target, optional: this.optional };
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
  ): { value: any; target?: any; optional?: boolean } | undefined {
    if (!context.scope) {
      return undefined;
    }
    if (path.path.startsWith("root.") && context.rootScope) {
      const localPath = path.path.slice("root.".length);
      const value = context.rootScope.getPath(`self.${localPath}`);
      const targetPath = localPath.split(".").slice(0, -1).join(".");
      const target = targetPath
        ? context.rootScope.getPath(`self.${targetPath}`)
        : context.rootScope;
      return { value, target, optional: this.optional };
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
    return { value, target, optional: this.optional };
  }

  private resolveFromGlobals(
    context: ExecutionContext,
    path: { path: string; root: string }
  ): { value: any; target?: any; optional?: boolean } | undefined {
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
        return { value: undefined, target: parent, optional: this.optional };
      }
      value = value?.[part];
    }
    return { value, target: parent, optional: this.optional };
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

export type ArrayElement = ExpressionNode | SpreadElement;

export class ArrayExpression extends BaseNode {
  constructor(public elements: ArrayElement[]) {
    super("ArrayExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const values: any[] = [];
    for (const element of this.elements) {
      if (element instanceof SpreadElement) {
        const spreadValue = await element.value.evaluate(context);
        if (spreadValue == null) {
          continue;
        }
        const iterator = (spreadValue as any)[Symbol.iterator];
        if (typeof iterator === "function") {
          for (const entry of spreadValue as any) {
            values.push(entry);
          }
        } else {
          values.push(spreadValue);
        }
        continue;
      }
      values.push(await element.evaluate(context));
    }
    return values;
  }
}

export type ObjectEntry =
  | { key: string; value: ExpressionNode; computed?: false }
  | { keyExpr: ExpressionNode; value: ExpressionNode; computed: true }
  | { spread: ExpressionNode };

export class ObjectExpression extends BaseNode {
  constructor(public entries: ObjectEntry[]) {
    super("ObjectExpression");
  }

  async evaluate(context: ExecutionContext): Promise<any> {
    const result: Record<string, any> = {};
    for (const entry of this.entries) {
      if ("spread" in entry) {
        const spreadValue = await entry.spread.evaluate(context);
        if (spreadValue != null) {
          Object.assign(result, spreadValue);
        }
        continue;
      }
      if ("computed" in entry && entry.computed) {
        const keyValue = await entry.keyExpr.evaluate(context);
        result[String(keyValue)] = await entry.value.evaluate(context);
      } else {
        result[entry.key] = await entry.value.evaluate(context);
      }
    }
    return result;
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
