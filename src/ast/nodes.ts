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
  self?: any;
  returnValue?: any;
  returning?: boolean;
  breaking?: boolean;
  continuing?: boolean;
}

export interface CFSNode {
  type: string;
  prepare(context: ExecutionContext): Promise<void>;
  evaluate(context: ExecutionContext): any;
}

export abstract class BaseNode implements CFSNode {
  constructor(public type: string) {}

  async prepare(_context: ExecutionContext): Promise<void> {
    return;
  }

  evaluate(_context: ExecutionContext): any {
    return undefined;
  }
}

function isPromiseLike<T>(value: T | Promise<T>): value is Promise<T> {
  return Boolean(value) && typeof (value as Promise<T>).then === "function";
}

function resolveMaybe<T, R>(value: T | Promise<T>, next: (value: T) => R | Promise<R>): R | Promise<R> {
  if (isPromiseLike(value)) {
    return value.then(next);
  }
  return next(value);
}

function evaluateWithChildScope(context: ExecutionContext, block: BlockNode): any {
  const scope = context.scope;
  if (!scope || !scope.createChild) {
    return block.evaluate(context);
  }
  const previousScope = context.scope;
  context.scope = scope.createChild();
  try {
    return block.evaluate(context);
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

  evaluate(context: ExecutionContext): any {
    let index = 0;
    const run = (): any => {
      while (index < this.statements.length) {
        if (context.returning || context.breaking || context.continuing) {
          break;
        }
        const statement = this.statements[index];
        index += 1;
        if (statement && typeof statement.evaluate === "function") {
          const result = statement.evaluate(context);
          if (isPromiseLike(result)) {
            return result.then(() => run());
          }
        }
      }
      return undefined;
    };
    return run();
  }
}

export class SelectorNode extends BaseNode {
  constructor(public selectorText: string) {
    super("Selector");
  }
}

export class BehaviorNode extends BaseNode {
  constructor(
    public selector: SelectorNode,
    public body: BlockNode,
    public flags: BehaviorFlags = {},
    public flagArgs: BehaviorFlagArgs = {}
  ) {
    super("Behavior");
  }
}


export class OnBlockNode extends BaseNode {
  constructor(
    public eventName: string,
    public args: string[],
    public body: BlockNode,
    public flags: DeclarationFlags = {},
    public flagArgs: DeclarationFlagArgs = {}
  ) {
    super("OnBlock");
  }
}

export class AssignmentNode extends BaseNode {
  constructor(
    public target: AssignmentTarget,
    public value: ExpressionNode,
    public operator: "=" | "+=" | "-=" | "*=" | "/=" | "~=" | "++" | "--" = "=",
    public prefix = false
  ) {
    super("Assignment");
  }

  evaluate(context: ExecutionContext): any {
    const target = this.target;
    if (target instanceof DirectiveExpression) {
      const value = this.value.evaluate(context);
      return resolveMaybe(value, (resolvedValue) => {
        this.assignDirectiveTarget(context, target, resolvedValue, this.operator);
        return resolvedValue;
      });
    }
    if (target instanceof ElementDirectiveExpression) {
      const elementValue = target.element.evaluate(context);
      return resolveMaybe(elementValue, (resolvedElement) => {
        const element = resolveElementFromReference(resolvedElement);
        if (!element) {
          return undefined;
        }
        const value = this.value.evaluate(context);
        return resolveMaybe(value, (resolvedValue) => {
          this.assignDirectiveTarget(
            { ...context, element },
            target.directive,
            resolvedValue,
            this.operator
          );
          return resolvedValue;
        });
      });
    }
    if (!context.scope || !context.scope.setPath) {
      return undefined;
    }
    if (this.operator === "++" || this.operator === "--") {
      return this.applyIncrement(context);
    }
    const value = this.value.evaluate(context);
    return resolveMaybe(value, (resolvedValue) => {
      if (this.operator !== "=") {
        return this.applyCompoundAssignment(context, resolvedValue);
      }
      if (this.target instanceof IdentifierExpression && this.target.name.startsWith("root.") && context.rootScope) {
        const path = this.target.name.slice("root.".length);
        context.rootScope.setPath?.(`self.${path}`, resolvedValue);
        return resolvedValue;
      }
      if (this.target instanceof MemberExpression || this.target instanceof IndexExpression) {
        const resolved = this.resolveAssignmentTarget(context);
        return resolveMaybe(resolved, (resolvedTarget) => {
          if (resolvedTarget?.scope?.setPath) {
            resolvedTarget.scope.setPath(resolvedTarget.path, resolvedValue);
            return resolvedValue;
          }
          this.assignTarget(context, this.target, resolvedValue);
          return resolvedValue;
        });
      }
      this.assignTarget(context, this.target, resolvedValue, this.operator);
      return resolvedValue;
    });
  }

  private applyCompoundAssignment(context: ExecutionContext, value: any): any {
    if (!context.scope || !context.scope.setPath) {
      return undefined;
    }
    const resolved = this.resolveAssignmentTarget(context);
    return resolveMaybe(resolved, (resolvedTarget) => {
      if (!resolvedTarget) {
        throw new Error("Compound assignment requires a simple identifier or member path");
      }
      const { scope, path } = resolvedTarget;
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
    });
  }

  private applyIncrement(context: ExecutionContext): any {
    if (!context.scope || !context.scope.setPath) {
      return undefined;
    }
    const resolved = this.resolveAssignmentTarget(context);
    return resolveMaybe(resolved, (resolvedTarget) => {
      if (!resolvedTarget) {
        throw new Error("Increment/decrement requires a simple identifier or member path");
      }
      const { scope, path } = resolvedTarget;
      const current = scope?.getPath ? scope.getPath(path) : undefined;
      const numeric = typeof current === "number" ? current : Number(current);
      const delta = this.operator === "++" ? 1 : -1;
      const next = (Number.isNaN(numeric) ? 0 : numeric) + delta;
      scope?.setPath?.(path, next);
      return this.prefix ? next : numeric;
    });
  }

  private resolveAssignmentTarget(
    context: ExecutionContext
  ): { scope: ExecutionContext["scope"]; path: string } | null | Promise<{ scope: ExecutionContext["scope"]; path: string } | null> {
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
      if (resolvedPath) {
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
      const targetExpr = this.target;
      const basePath = this.resolveTargetPath(context, targetExpr.target);
      return resolveMaybe(basePath, (resolvedBase) => {
        if (!resolvedBase) {
          return null;
        }
        const path = `${resolvedBase}.${targetExpr.property}`;
        const isRoot = path.startsWith("root.");
        const rawPath = isRoot ? path.slice("root.".length) : path;
        if (isRoot) {
          if (context.rootScope) {
            return { scope: context.rootScope, path: `self.${rawPath}` };
          }
          return { scope: context.scope, path: `root.${rawPath}` };
        }
        return { scope: context.scope, path: rawPath };
      });
    }
    if (this.target instanceof IndexExpression) {
      const path = this.resolveIndexPath(context, this.target);
      return resolveMaybe(path, (resolvedPath) => {
        if (!resolvedPath) {
          return null;
        }
        const isRoot = resolvedPath.startsWith("root.");
        const rawPath = isRoot ? resolvedPath.slice("root.".length) : resolvedPath;
        if (isRoot) {
          if (context.rootScope) {
            return { scope: context.rootScope, path: `self.${rawPath}` };
          }
          return { scope: context.scope, path: `root.${rawPath}` };
        }
        return { scope: context.scope, path: rawPath };
      });
    }
    return null;
  }

  private resolveIndexPath(context: ExecutionContext, expr: IndexExpression): string | null | Promise<string | null> {
    const base = this.resolveTargetPath(context, expr.target);
    return resolveMaybe(base, (resolvedBase) => {
      if (!resolvedBase) {
        return null;
      }
      const indexValue = expr.index.evaluate(context);
      return resolveMaybe(indexValue, (resolvedIndex) => {
        if (resolvedIndex == null) {
          return null;
        }
        return `${resolvedBase}.${resolvedIndex}`;
      });
    });
  }

  private resolveTargetPath(context: ExecutionContext, target: ExpressionNode): string | null | Promise<string | null> {
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

  private assignTarget(
    context: ExecutionContext,
    target: AssignmentTarget,
    value: any,
    operator: AssignmentNode["operator"] = "="
  ): void {
    if (!context.scope || !context.scope.setPath) {
      return;
    }
    if (target instanceof DirectiveExpression) {
      this.assignDirectiveTarget(context, target, value, operator);
      return;
    }
    if (target instanceof ElementDirectiveExpression) {
      const elementValue = target.element.evaluate(context);
      const next = resolveMaybe(elementValue, (resolvedElement) => {
        const element = resolveElementFromReference(resolvedElement);
        if (!element) {
          return;
        }
        this.assignDirectiveTarget(
          { ...context, element },
          target.directive,
          value,
          operator
        );
      });
      if (isPromiseLike(next)) {
        void next;
      }
      return;
    }
    if (target instanceof ElementPropertyExpression) {
      const elementValue = target.element.evaluate(context);
      const next = resolveMaybe(elementValue, (resolvedElement) => {
        if (resolvedElement && typeof resolvedElement === "object" && resolvedElement.__scope) {
          resolvedElement.__scope.setPath?.(target.property, value);
          return;
        }
        const element = resolveElementFromReference(resolvedElement);
        if (!element) {
          return;
        }
        (element as any)[target.property] = value;
      });
      if (isPromiseLike(next)) {
        void next;
      }
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
        this.assignTarget(context, element, source[index], operator);
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
        this.assignTarget(context, entry.target, (source as any)[entry.key], operator);
      }
      return;
    }
  }

  private assignDirectiveTarget(
    context: ExecutionContext,
    target: DirectiveExpression,
    value: any,
    operator: AssignmentNode["operator"] = "="
  ): void {
    const element = context.element;
    if (!element) {
      return;
    }
    if (target.kind === "attr") {
      if (target.name === "class" && "classList" in element && operator !== "=") {
        const classes = normalizeClassList(value);
        if (classes.length === 0) {
          return;
        }
        if (operator === "+=") {
          element.classList.add(...classes);
          return;
        }
        if (operator === "-=") {
          element.classList.remove(...classes);
          return;
        }
        if (operator === "~=") {
          for (const name of classes) {
            element.classList.toggle(name);
          }
          return;
        }
      }
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

function normalizeClassList(value: any): string[] {
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(/\s+/))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return String(value)
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export class ReturnNode extends BaseNode {
  constructor(public value?: ExpressionNode) {
    super("Return");
  }

  evaluate(context: ExecutionContext): any {
    if (context.returning) {
      return context.returnValue;
    }
    const nextValue = this.value ? this.value.evaluate(context) : undefined;
    return resolveMaybe(nextValue, (resolved) => {
      context.returnValue = resolved;
      context.returning = true;
      return context.returnValue;
    });
  }
}

export class BreakNode extends BaseNode {
  constructor() {
    super("Break");
  }

  evaluate(context: ExecutionContext): any {
    context.breaking = true;
    return undefined;
  }
}

export class ContinueNode extends BaseNode {
  constructor() {
    super("Continue");
  }

  evaluate(context: ExecutionContext): any {
    context.continuing = true;
    return undefined;
  }
}

export class AssertError extends Error {
  constructor(message = "Assertion failed") {
    super(message);
    this.name = "AssertError";
  }
}

export class AssertNode extends BaseNode {
  constructor(public test: ExpressionNode) {
    super("Assert");
  }

  evaluate(context: ExecutionContext): any {
    const value = this.test.evaluate(context);
    return resolveMaybe(value, (resolved) => {
      if (!resolved) {
        throw new AssertError();
      }
      return resolved;
    });
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

  evaluate(context: ExecutionContext): any {
    const condition = this.test.evaluate(context);
    return resolveMaybe(condition, (resolved) => {
      if (resolved) {
        return evaluateWithChildScope(context, this.consequent);
      }
      if (this.alternate) {
        return evaluateWithChildScope(context, this.alternate);
      }
      return undefined;
    });
  }
}

export class WhileNode extends BaseNode {
  constructor(public test: ExpressionNode, public body: BlockNode) {
    super("While");
  }

  evaluate(context: ExecutionContext): any {
    const previousScope = context.scope;
    if (context.scope?.createChild) {
      context.scope = context.scope.createChild();
    }
    const run = (): any => {
      const condition = this.test.evaluate(context);
      return resolveMaybe(condition, (resolved) => {
        if (!resolved || context.returning) {
          return undefined;
        }
        const bodyResult = this.body.evaluate(context);
        return resolveMaybe(bodyResult, () => {
          if (context.breaking) {
            context.breaking = false;
            return undefined;
          }
          if (context.continuing) {
            context.continuing = false;
          }
          return run();
        });
      });
    };
    const result = run();
    if (isPromiseLike(result)) {
      return result.finally(() => {
        context.scope = previousScope;
      });
    }
    context.scope = previousScope;
    return result;
  }
}

export class ForEachNode extends BaseNode {
  constructor(
    public target: IdentifierExpression,
    public iterable: ExpressionNode,
    public kind: "in" | "of",
    public body: BlockNode
  ) {
    super("ForEach");
  }

  evaluate(context: ExecutionContext): any {
    const iterableValue = this.iterable.evaluate(context);
    return resolveMaybe(iterableValue, (resolved) => {
      const entries = this.getEntries(resolved);
      const previousScope = context.scope;
      let bodyScope = context.scope;
      if (context.scope?.createChild) {
        bodyScope = context.scope.createChild();
      }
      let index = 0;
      const loop = (): any => {
        if (index >= entries.length || context.returning) {
          context.scope = previousScope;
          return undefined;
        }
        const value = entries[index]!;
        index += 1;
        context.scope = bodyScope;
        context.scope?.setPath?.(this.target.name, value);
        const bodyResult = this.body.evaluate(context);
        return resolveMaybe(bodyResult, () => {
          if (context.breaking) {
            context.breaking = false;
            context.scope = previousScope;
            return undefined;
          }
          if (context.continuing) {
            context.continuing = false;
          }
          context.scope = previousScope;
          return loop();
        });
      };
      return loop();
    });
  }

  private getEntries(value: any): any[] {
    if (value == null) {
      return [];
    }
    if (this.kind === "in") {
      if (typeof value === "object") {
        return Object.keys(value);
      }
      return [];
    }
    if (typeof value === "string") {
      return Array.from(value);
    }
    if (typeof value[Symbol.iterator] === "function") {
      return Array.from(value as Iterable<any>);
    }
    if (typeof value === "object") {
      return Object.values(value);
    }
    return [];
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

  evaluate(context: ExecutionContext): any {
    const initResult = this.init ? this.init.evaluate(context) : undefined;
    const run = (): any => {
      const previousScope = context.scope;
      let bodyScope = context.scope;
      if (context.scope?.createChild) {
        bodyScope = context.scope.createChild();
      }
      const loop = (): any => {
        const testResult = this.test ? this.test.evaluate(context) : true;
        return resolveMaybe(testResult, (passed) => {
          if (!passed || context.returning) {
            context.scope = previousScope;
            return undefined;
          }
          context.scope = bodyScope;
          const bodyResult = this.body.evaluate(context);
          return resolveMaybe(bodyResult, () => {
            if (context.returning) {
              context.scope = previousScope;
              return undefined;
            }
            if (context.breaking) {
              context.breaking = false;
              context.scope = previousScope;
              return undefined;
            }
            context.scope = previousScope;
            if (context.continuing) {
              context.continuing = false;
            }
            const updateResult = this.update ? this.update.evaluate(context) : undefined;
            return resolveMaybe(updateResult, () => loop());
          });
        });
      };
      return loop();
    };
    return resolveMaybe(initResult, () => run());
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

  evaluate(context: ExecutionContext): any {
    const handleError = (error: any): any => {
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
      const handlerResult = this.handler.evaluate(context);
      return resolveMaybe(handlerResult, () => {
        if (scope && scope.setPath && handlerScope === previousScope) {
          scope.setPath(this.errorName, previous);
        }
        context.scope = previousScope;
        return undefined;
      });
    };

    try {
      const bodyResult = evaluateWithChildScope(context, this.body);
      if (isPromiseLike(bodyResult)) {
        return bodyResult.catch((error) => handleError(error));
      }
      return bodyResult;
    } catch (error) {
      return handleError(error);
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

  evaluate(context: ExecutionContext): any {
    const scope = context.scope;
    const globals = context.globals;
    const element = context.element;

    if (this.isAsync) {
      return (...args: any[]) => {
        const activeScope = scope?.createChild ? scope.createChild() : scope;
        const inner: ExecutionContext = {
          scope: activeScope,
          rootScope: context.rootScope,
          ...(globals ? { globals } : {}),
          ...(element ? { element } : {}),
          ...(context.self ? { self: context.self } : {}),
          returnValue: undefined,
          returning: false,
          breaking: false,
          continuing: false
        };
        const previousValues = new Map<string, any>();
        const applyResult = activeScope
          ? this.applyParams(activeScope, previousValues, inner, args)
          : undefined;
        const bodyResult = resolveMaybe(applyResult, () => this.body.evaluate(inner));
        const finalResult = resolveMaybe(bodyResult, () => inner.returnValue);
        return Promise.resolve(finalResult).finally(() => {
          if (activeScope && activeScope === scope) {
            this.restoreParams(activeScope, previousValues);
          }
        });
      };
    }

    return (...args: any[]) => {
      const activeScope = scope?.createChild ? scope.createChild() : scope;
      const inner: ExecutionContext = {
        scope: activeScope,
        rootScope: context.rootScope,
        ...(globals ? { globals } : {}),
        ...(element ? { element } : {}),
        ...(context.self ? { self: context.self } : {}),
        returnValue: undefined,
        returning: false,
        breaking: false,
        continuing: false
      };
      const previousValues = new Map<string, any>();
      const applyResult = activeScope
        ? this.applyParams(activeScope, previousValues, inner, args)
        : undefined;
      const bodyResult = resolveMaybe(applyResult, () => this.body.evaluate(inner));
      const finalResult = resolveMaybe(bodyResult, () => inner.returnValue);
      if (isPromiseLike(finalResult)) {
        return finalResult.finally(() => {
          if (activeScope && activeScope === scope) {
            this.restoreParams(activeScope, previousValues);
          }
        });
      }
      if (activeScope && activeScope === scope) {
        this.restoreParams(activeScope, previousValues);
      }
      return finalResult;
    };
  }

  private applyParams(
    scope: ExecutionContext["scope"],
    previousValues: Map<string, any>,
    context: ExecutionContext,
    args: any[]
  ): any {
    if (!scope) {
      return;
    }
    const setPath = scope.setPath?.bind(scope);
    if (!setPath) {
      return;
    }
    const params = this.params;
    const applyAt = (paramIndex: number, argIndex: number): any => {
      for (let i = paramIndex; i < params.length; i += 1) {
        const param = params[i]!;
        const name = param.name;
        if (!name) {
          continue;
        }
        previousValues.set(name, scope.getPath(name));
        if (param.rest) {
          setPath(`self.${name}`, args.slice(argIndex));
          return;
        }
        let value = args[argIndex];
        if (value === undefined && param.defaultValue) {
          const defaultValue = param.defaultValue.evaluate(context);
          return resolveMaybe(defaultValue, (resolvedDefault) => {
            setPath(`self.${name}`, resolvedDefault);
            return applyAt(i + 1, argIndex + 1);
          });
        }
        setPath(`self.${name}`, value);
        argIndex += 1;
      }
      return;
    };
    return applyAt(0, 0);
  }

  private restoreParams(scope: ExecutionContext["scope"], previousValues: Map<string, any>): void {
    if (!scope) {
      return;
    }
    const setPath = scope.setPath?.bind(scope);
    if (!setPath) {
      return;
    }
    for (const param of this.params) {
      const name = param.name;
      if (!name) {
        continue;
      }
      setPath(name, previousValues.get(name));
    }
  }
}

export interface DeclarationFlags {
  important?: boolean;
  debounce?: boolean;
  [key: string]: boolean | undefined;
}

export interface DeclarationFlagArgs {
  debounce?: number;
  [key: string]: any;
}

export interface BehaviorFlags {
  [key: string]: boolean | undefined;
}

export interface BehaviorFlagArgs {
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
  | AssignmentNode
  | IdentifierExpression
  | ElementRefExpression
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
  | ElementDirectiveExpression
  | ElementPropertyExpression
  | QueryExpression;

export type DeclarationTarget = IdentifierExpression | DirectiveExpression;
export type AssignmentTarget =
  | IdentifierExpression
  | MemberExpression
  | IndexExpression
  | DirectiveExpression
  | ElementDirectiveExpression
  | ElementPropertyExpression
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

  evaluate(context: ExecutionContext): any {
    if (this.name === "self") {
      return context.self ?? context.element ?? context.scope;
    }
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

export class ElementRefExpression extends BaseNode {
  constructor(public id: string) {
    super("ElementRef");
  }

  evaluate(context: ExecutionContext): any {
    const doc = context.element?.ownerDocument ?? (typeof document !== "undefined" ? document : undefined);
    if (!doc) {
      return undefined;
    }
    const element = doc.getElementById(this.id);
    if (!element) {
      return undefined;
    }
    const engine = (globalThis as any).VSNEngine;
    const scope = engine?.getScope ? engine.getScope(element) : undefined;
    return { __element: element, __scope: scope };
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

  evaluate(): any {
    return this.value;
  }
}

export class TemplateExpression extends BaseNode {
  constructor(public parts: ExpressionNode[]) {
    super("TemplateExpression");
  }

  evaluate(context: ExecutionContext): any {
    let result = "";
    let index = 0;
    const run = (): any => {
      while (index < this.parts.length) {
        const part = this.parts[index]!;
        index += 1;
        const value = part.evaluate(context);
        return resolveMaybe(value, (resolved) => {
          result += resolved == null ? "" : String(resolved);
          return run();
        });
      }
      return result;
    };
    return run();
  }
}

export class UnaryExpression extends BaseNode {
  constructor(public operator: string, public argument: ExpressionNode) {
    super("UnaryExpression");
  }

  evaluate(context: ExecutionContext): any {
    const value = this.argument.evaluate(context);
    return resolveMaybe(value, (resolved) => {
      if (this.operator === "!") {
        return !resolved;
      }
      if (this.operator === "-") {
        return -(resolved as any);
      }
      return resolved;
    });
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

  evaluate(context: ExecutionContext): any {
    const leftValue = this.left.evaluate(context);
    return resolveMaybe(leftValue, (resolvedLeft) => {
      if (this.operator === "&&") {
        if (!resolvedLeft) {
          return resolvedLeft;
        }
        return this.right.evaluate(context);
      }
      if (this.operator === "||") {
        if (resolvedLeft) {
          return resolvedLeft;
        }
        return this.right.evaluate(context);
      }
      if (this.operator === "??") {
        if (resolvedLeft !== null && resolvedLeft !== undefined) {
          return resolvedLeft;
        }
        return this.right.evaluate(context);
      }
      const rightValue = this.right.evaluate(context);
      return resolveMaybe(rightValue, (resolvedRight) => {
        if (this.operator === "+") {
          return (resolvedLeft as any) + (resolvedRight as any);
        }
        if (this.operator === "-") {
          return (resolvedLeft as any) - (resolvedRight as any);
        }
        if (this.operator === "*") {
          return (resolvedLeft as any) * (resolvedRight as any);
        }
        if (this.operator === "/") {
          return (resolvedLeft as any) / (resolvedRight as any);
        }
        if (this.operator === "%") {
          return (resolvedLeft as any) % (resolvedRight as any);
        }
        if (this.operator === "==") {
          return resolvedLeft == resolvedRight;
        }
        if (this.operator === "!=") {
          return resolvedLeft != resolvedRight;
        }
        if (this.operator === "===") {
          return resolvedLeft === resolvedRight;
        }
        if (this.operator === "!==") {
          return resolvedLeft !== resolvedRight;
        }
        if (this.operator === "<") {
          return (resolvedLeft as any) < (resolvedRight as any);
        }
        if (this.operator === ">") {
          return (resolvedLeft as any) > (resolvedRight as any);
        }
        if (this.operator === "<=") {
          return (resolvedLeft as any) <= (resolvedRight as any);
        }
        if (this.operator === ">=") {
          return (resolvedLeft as any) >= (resolvedRight as any);
        }
        return undefined;
      });
    });
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

  evaluate(context: ExecutionContext): any {
    const condition = this.test.evaluate(context);
    return resolveMaybe(condition, (resolved) => {
      if (resolved) {
        return this.consequent.evaluate(context);
      }
      return this.alternate.evaluate(context);
    });
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

  evaluate(context: ExecutionContext): any {
    const resolved = this.resolve(context);
    return resolveMaybe(resolved, (resolvedValue) => resolvedValue?.value);
  }

  resolve(
    context: ExecutionContext
  ): { value: any; target?: any; optional?: boolean } | undefined | Promise<{ value: any; target?: any; optional?: boolean } | undefined> {
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

    const target = this.target.evaluate(context);
    return resolveMaybe(target, (resolvedTarget) => {
      if (resolvedTarget == null) {
        return { value: undefined, target: resolvedTarget, optional: this.optional };
      }
      return { value: (resolvedTarget as any)[this.property], target: resolvedTarget, optional: this.optional };
    });
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

  evaluate(context: ExecutionContext): any {
    const resolved = this.resolveCallee(context);
    return resolveMaybe(resolved, (resolvedCallee) => {
      const fnValue = resolvedCallee?.fn ?? this.callee.evaluate(context);
      return resolveMaybe(fnValue, (resolvedFn) => {
        if (typeof resolvedFn !== "function") {
          return undefined;
        }
        const values: any[] = [];
        const evalArgs = (index: number): any => {
          for (let i = index; i < this.args.length; i += 1) {
            const arg = this.args[i]!;
            const argValue = arg.evaluate(context);
            return resolveMaybe(argValue, (resolvedArg) => {
              values.push(resolvedArg);
              return evalArgs(i + 1);
            });
          }
          return resolvedFn.apply(resolvedCallee?.thisArg, values);
        };
        return evalArgs(0);
      });
    });
  }

  private resolveCallee(
    context: ExecutionContext
  ): { fn: any; thisArg?: any } | undefined | Promise<{ fn: any; thisArg?: any } | undefined> {
    if (this.callee instanceof MemberExpression) {
      const resolved = this.callee.resolve(context);
      return resolveMaybe(resolved, (resolvedValue) => {
        if (!resolvedValue) {
          return undefined;
        }
        return { fn: resolvedValue.value, thisArg: resolvedValue.target };
      });
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

  evaluate(context: ExecutionContext): any {
    const values: any[] = [];
    const pushElements = (value: any) => {
      if (value == null) {
        return;
      }
      const iterator = (value as any)[Symbol.iterator];
      if (typeof iterator === "function") {
        for (const entry of value as any) {
          values.push(entry);
        }
      } else {
        values.push(value);
      }
    };
    const evalAt = (index: number): any => {
      for (let i = index; i < this.elements.length; i += 1) {
        const element = this.elements[i]!;
        if (element instanceof SpreadElement) {
          const spreadValue = element.value.evaluate(context);
          return resolveMaybe(spreadValue, (resolvedSpread) => {
            pushElements(resolvedSpread);
            return evalAt(i + 1);
          });
        }
        const value = element.evaluate(context);
        return resolveMaybe(value, (resolvedValue) => {
          values.push(resolvedValue);
          return evalAt(i + 1);
        });
      }
      return values;
    };
    return evalAt(0);
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

  evaluate(context: ExecutionContext): any {
    const result: Record<string, any> = {};
    const evalAt = (index: number): any => {
      for (let i = index; i < this.entries.length; i += 1) {
        const entry = this.entries[i]!;
        if ("spread" in entry) {
          const spreadValue = entry.spread.evaluate(context);
          return resolveMaybe(spreadValue, (resolvedSpread) => {
            if (resolvedSpread != null) {
              Object.assign(result, resolvedSpread);
            }
            return evalAt(i + 1);
          });
        }
        if ("computed" in entry && entry.computed) {
          const keyValue = entry.keyExpr.evaluate(context);
          return resolveMaybe(keyValue, (resolvedKey) => {
            const entryValue = entry.value.evaluate(context);
            return resolveMaybe(entryValue, (resolvedValue) => {
              result[String(resolvedKey)] = resolvedValue;
              return evalAt(i + 1);
            });
          });
        }
        const value = entry.value.evaluate(context);
        return resolveMaybe(value, (resolvedValue) => {
          result[entry.key] = resolvedValue;
          return evalAt(i + 1);
        });
      }
      return result;
    };
    return evalAt(0);
  }
}

export class IndexExpression extends BaseNode {
  constructor(public target: ExpressionNode, public index: ExpressionNode) {
    super("IndexExpression");
  }

  evaluate(context: ExecutionContext): any {
    const target = this.target.evaluate(context);
    return resolveMaybe(target, (resolvedTarget) => {
      if (resolvedTarget == null) {
        return undefined;
      }
      const index = this.index.evaluate(context);
      return resolveMaybe(index, (resolvedIndex) => {
        if (resolvedIndex == null) {
          return undefined;
        }
        const key = this.normalizeIndexKey(resolvedTarget, resolvedIndex);
        return (resolvedTarget as any)[key as any];
      });
    });
  }

  private normalizeIndexKey(target: unknown, index: unknown): unknown {
    if (Array.isArray(target) && typeof index === "string" && index.trim() !== "") {
      const numeric = Number(index);
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }
    return index;
  }
}

export class DirectiveExpression extends BaseNode {
  constructor(public kind: "attr" | "style", public name: string) {
    super("Directive");
  }

  evaluate(context: ExecutionContext): any {
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
      if (this.name === "text" && element instanceof HTMLElement) {
        return element.innerText;
      }
      if (this.name === "content" && element instanceof HTMLElement) {
        return element.textContent ?? "";
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

export class ElementDirectiveExpression extends BaseNode {
  constructor(public element: ExpressionNode, public directive: DirectiveExpression) {
    super("ElementDirective");
  }

  evaluate(context: ExecutionContext): any {
    const elementValue = this.element.evaluate(context);
    return resolveMaybe(elementValue, (resolvedElement) => {
      const element = resolveElementFromReference(resolvedElement);
      if (!element) {
        return undefined;
      }
      const nextContext: ExecutionContext = { ...context, element };
      return this.directive.evaluate(nextContext);
    });
  }
}

export class ElementPropertyExpression extends BaseNode {
  constructor(public element: ExpressionNode, public property: string) {
    super("ElementProperty");
  }

  evaluate(context: ExecutionContext): any {
    const elementValue = this.element.evaluate(context);
    return resolveMaybe(elementValue, (resolvedElement) => {
      if (resolvedElement && typeof resolvedElement === "object" && resolvedElement.__scope) {
        return resolvedElement.__scope.getPath?.(this.property);
      }
      const element = resolveElementFromReference(resolvedElement);
      if (!element) {
        return undefined;
      }
      return (element as any)[this.property];
    });
  }
}

function resolveElementFromReference(value: any): Element | undefined {
  if (value && typeof value === "object") {
    if (value.nodeType === 1) {
      return value as Element;
    }
    const candidate = value.__element;
    if (candidate && typeof candidate === "object" && candidate.nodeType === 1) {
      return candidate as Element;
    }
  }
  return undefined;
}

export class AwaitExpression extends BaseNode {
  constructor(public argument: ExpressionNode) {
    super("AwaitExpression");
  }

  evaluate(context: ExecutionContext): any {
    const value = this.argument.evaluate(context);
    return Promise.resolve(value);
  }
}

export class QueryExpression extends BaseNode {
  constructor(public direction: "self" | "descendant" | "ancestor", public selector: string) {
    super("Query");
  }

  evaluate(context: ExecutionContext): any {
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
