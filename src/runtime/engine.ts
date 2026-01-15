import { Scope } from "./scope";
import { applyBindToElement, applyBindToScope, BindDirection } from "./bindings";
import { applyIf, applyShow } from "./conditionals";
import { applyHtml } from "./html";
import { applyGet, GetConfig } from "./http";
import { debounce } from "./debounce";
import { Parser } from "../parser/parser";
import {
  BehaviorNode,
  BlockNode,
  DeclarationNode,
  DirectiveExpression,
  ExecutionContext,
  IdentifierExpression,
  OnBlockNode
} from "../ast/nodes";

interface OnConfig {
  event: string;
  code: string;
  debounceMs?: number;
}

interface BindConfig {
  expr: string;
  direction: BindDirection;
}

interface LifecycleConfig {
  construct?: string;
  destruct?: string;
}

interface RegisteredBehavior {
  id: number;
  selector: string;
  specificity: number;
  order: number;
  construct?: BlockNode;
  destruct?: BlockNode;
  onBlocks: { event: string; body: BlockNode }[];
  declarations: DeclarationNode[];
}

type AttributeHandler = {
  id: string;
  match: (name: string) => boolean;
  handle: (element: Element, name: string, value: string, scope: Scope) => boolean | void;
};

export class Engine {
  private scopes = new WeakMap<Element, Scope>();
  private bindBindings = new WeakMap<Element, BindConfig>();
  private ifBindings = new WeakMap<Element, string>();
  private showBindings = new WeakMap<Element, string>();
  private htmlBindings = new WeakMap<Element, { expr: string; trusted: boolean }>();
  private getBindings = new WeakMap<Element, GetConfig>();
  private lifecycleBindings = new WeakMap<Element, LifecycleConfig>();
  private behaviorRegistry: RegisteredBehavior[] = [];
  private behaviorBindings = new WeakMap<Element, Set<number>>();
  private behaviorId = 0;
  private codeCache = new Map<string, BlockNode>();
  private observer?: MutationObserver;
  private attributeHandlers: AttributeHandler[] = [];
  private globals: Record<string, any> = {};
  private importantFlags = new WeakMap<Element, Set<string>>();

  constructor() {
    this.registerGlobal("console", console);
    this.registerQueryHelpers();
    this.registerDefaultAttributeHandlers();
  }

  async mount(root: HTMLElement): Promise<void> {
    const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      if (!this.hasVsnAttributes(element)) {
        continue;
      }
      const parentScope = this.findParentScope(element);
      this.getScope(element, parentScope);
      this.attachAttributes(element);
      this.runConstruct(element);
    }
    await this.applyBehaviors(root);
    this.attachObserver(root);
  }

  unmount(element: Element): void {
    this.runDestruct(element);
  }

  registerBehaviors(source: string): void {
    const program = new Parser(source).parseProgram();
    for (const use of program.uses) {
      const value = this.resolveGlobalPath(use.name);
      if (value === undefined) {
        console.warn(`vsn: global '${use.name}' not found`);
        continue;
      }
      this.registerGlobal(use.alias, value);
    }
    for (const behavior of program.behaviors) {
      this.collectBehavior(behavior);
    }
  }

  registerGlobal(name: string, value: any): void {
    this.globals[name] = value;
  }

  registerGlobals(values: Record<string, any>): void {
    Object.assign(this.globals, values);
  }

  registerAttributeHandler(handler: AttributeHandler): void {
    this.attributeHandlers.push(handler);
  }

  private resolveGlobalPath(name: string): any {
    const parts = name.split(".");
    const root = parts[0];
    if (!root) {
      return undefined;
    }
    let value: any = (globalThis as any)[root];
    for (let i = 1; i < parts.length; i += 1) {
      const part = parts[i];
      if (!part) {
        return undefined;
      }
      value = value?.[part];
    }
    return value;
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

  private attachObserver(root: HTMLElement): void {
    if (this.observer) {
      return;
    }
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node && node.nodeType === 1) {
            this.handleAddedNode(node as Element);
          }
        }
        for (const node of Array.from(mutation.removedNodes)) {
          if (node && node.nodeType === 1) {
            this.handleRemovedNode(node as Element);
          }
        }
      }
    });
    this.observer.observe(root, { childList: true, subtree: true });
  }

  private handleRemovedNode(node: Element): void {
    if (this.lifecycleBindings.has(node)) {
      this.runDestruct(node);
    }
    if (this.behaviorBindings.has(node)) {
      this.runBehaviorDestruct(node);
    }
    for (const child of Array.from(node.querySelectorAll("*"))) {
      if (this.lifecycleBindings.has(child)) {
        this.runDestruct(child);
      }
      if (this.behaviorBindings.has(child)) {
        this.runBehaviorDestruct(child);
      }
    }
  }

  private handleAddedNode(node: Element): void {
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      if (!this.hasVsnAttributes(element)) {
        continue;
      }
      const parentScope = this.findParentScope(element);
      this.getScope(element, parentScope);
      this.attachAttributes(element);
      this.runConstruct(element);
    }
    void this.applyBehaviors(node);
  }

  private async applyBehaviors(root: Element): Promise<void> {
    if (this.behaviorRegistry.length === 0) {
      return;
    }
    const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      const bound = this.behaviorBindings.get(element) ?? new Set<number>();
      const matches = this.behaviorRegistry.filter((behavior) => {
        if (bound.has(behavior.id)) {
          return false;
        }
        return element.matches(behavior.selector);
      });
      if (matches.length === 0) {
        continue;
      }
      matches.sort((a, b) => {
        if (a.specificity !== b.specificity) {
          return a.specificity - b.specificity;
        }
        return a.order - b.order;
      });
      const scope = this.getScope(element);
      for (const behavior of matches) {
        bound.add(behavior.id);
        await this.applyBehaviorDeclarations(element, scope, behavior.declarations);
        if (behavior.construct) {
          await this.executeBlock(behavior.construct, scope, element);
        }
        for (const onBlock of behavior.onBlocks) {
          this.attachBehaviorOnHandler(element, onBlock.event, onBlock.body);
        }
      }
      this.behaviorBindings.set(element, bound);
    }
  }

  private runBehaviorDestruct(element: Element): void {
    const bound = this.behaviorBindings.get(element);
    if (!bound) {
      return;
    }
    const scope = this.getScope(element);
    for (const behavior of this.behaviorRegistry) {
      if (!bound.has(behavior.id) || !behavior.destruct) {
        continue;
      }
      void this.executeBlock(behavior.destruct, scope, element);
    }
  }

  private attachAttributes(element: Element): void {
    const scope = this.getScope(element);
    for (const name of element.getAttributeNames()) {
      if (!name.startsWith("vsn-")) {
        continue;
      }
      const value = element.getAttribute(name) ?? "";
      for (const handler of this.attributeHandlers) {
        if (!handler.match(name)) {
          continue;
        }
        const handled = handler.handle(element, name, value, scope);
        if (handled !== false) {
          break;
        }
      }
    }
  }

  private setLifecycle(element: Element, patch: LifecycleConfig): void {
    const current = this.lifecycleBindings.get(element) ?? {};
    this.lifecycleBindings.set(element, { ...current, ...patch });
  }

  private runConstruct(element: Element): void {
    const config = this.lifecycleBindings.get(element);
    if (!config?.construct) {
      return;
    }
    const scope = this.getScope(element);
    this.execute(config.construct, scope, element);
  }

  private runDestruct(element: Element): void {
    const config = this.lifecycleBindings.get(element);
    if (!config?.destruct) {
      return;
    }
    const scope = this.getScope(element);
    this.execute(config.destruct, scope, element);
  }

  private attachBindInputHandler(element: Element, expr: string): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const scope = this.getScope(element);
      applyBindToScope(element, expr, scope);
    };
    element.addEventListener("input", handler);
    element.addEventListener("change", handler);
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

  private watch(scope: Scope, expr: string, handler: () => void): void {
    const key = expr.trim();
    if (!key) {
      return;
    }
    scope.on(key, handler);
  }

  private watchWithDebounce(scope: Scope, expr: string, handler: () => void, debounceMs?: number): void {
    if (debounceMs) {
      this.watch(scope, expr, debounce(handler, debounceMs));
    } else {
      this.watch(scope, expr, handler);
    }
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
    const handler = async () => {
      const scope = this.getScope(element);
      await this.execute(config.code, scope, element);
      this.evaluate(element);
    };
    const effectiveHandler = config.debounceMs ? debounce(handler, config.debounceMs) : handler;
    element.addEventListener(config.event, effectiveHandler);
  }

  private attachBehaviorOnHandler(element: Element, event: string, body: BlockNode): void {
    const handler = async () => {
      const scope = this.getScope(element);
      await this.executeBlock(body, scope, element);
      this.evaluate(element);
    };
    element.addEventListener(event, handler);
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

  private async execute(code: string, scope: Scope, element?: Element): Promise<void> {
    let block = this.codeCache.get(code);
    if (!block) {
      block = Parser.parseInline(code);
      this.codeCache.set(code, block);
    }
    const context: ExecutionContext = {
      scope,
      globals: this.globals,
      ...(element ? { element } : {})
    };
    await block.evaluate(context);
  }

  private async executeBlock(block: BlockNode, scope: Scope, element?: Element): Promise<void> {
    const context: ExecutionContext = {
      scope,
      globals: this.globals,
      ...(element ? { element } : {})
    };
    await block.evaluate(context);
  }

  private collectBehavior(behavior: BehaviorNode, parentSelector?: string): void {
    const selector = parentSelector
      ? `${parentSelector} ${behavior.selector.selectorText}`
      : behavior.selector.selectorText;
    const lifecycle = this.extractLifecycle(behavior.body);
    this.behaviorRegistry.push({
      id: this.behaviorId += 1,
      selector,
      specificity: this.computeSpecificity(selector),
      order: this.behaviorRegistry.length,
      onBlocks: this.extractOnBlocks(behavior.body),
      declarations: this.extractDeclarations(behavior.body),
      ...lifecycle
    });
    for (const statement of behavior.body.statements) {
      if (statement instanceof BehaviorNode) {
        this.collectBehavior(statement, selector);
      }
    }
  }

  private computeSpecificity(selector: string): number {
    const idMatches = selector.match(/#[\w-]+/g)?.length ?? 0;
    const classMatches = selector.match(/\.[\w-]+/g)?.length ?? 0;
    const attrMatches = selector.match(/\[[^\]]+\]/g)?.length ?? 0;
    const pseudoMatches = selector.match(/:[\w-]+/g)?.length ?? 0;
    const elementMatches = selector.match(/(^|[\s>+~])([a-zA-Z][\w-]*)/g)?.length ?? 0;
    return idMatches * 100 + (classMatches + attrMatches + pseudoMatches) * 10 + elementMatches;
  }

  private registerQueryHelpers(): void {
    const queryDoc = (selector: string) => {
      if (typeof document === "undefined") {
        return [];
      }
      return Array.from(document.querySelectorAll(selector));
    };
    const queryWithin = (element: Element | undefined, selector: string) => {
      if (!element) {
        return [];
      }
      return Array.from(element.querySelectorAll(selector));
    };
    const queryAncestors = (element: Element | undefined, selector: string) => {
      const results: Element[] = [];
      let cursor = element?.parentElement;
      while (cursor) {
        if (cursor.matches(selector)) {
          results.push(cursor);
        }
        cursor = cursor.parentElement;
      }
      return results;
    };

    this.registerGlobal("?", (selector: string) => queryDoc(selector));
    this.registerGlobal("?>", (selector: string, element?: Element) => {
      return queryWithin(element, selector);
    });
    this.registerGlobal("?<", (selector: string, element?: Element) => {
      return queryAncestors(element, selector);
    });
  }

  private getImportantKey(declaration: DeclarationNode): string | undefined {
    if (declaration.target instanceof IdentifierExpression) {
      return `state:${declaration.target.name}`;
    }
    if (declaration.target instanceof DirectiveExpression) {
      return `${declaration.target.kind}:${declaration.target.name}`;
    }
    return undefined;
  }

  private isImportant(element: Element, key: string): boolean {
    const set = this.importantFlags.get(element);
    return set ? set.has(key) : false;
  }

  private markImportant(element: Element, key: string): void {
    const set = this.importantFlags.get(element) ?? new Set<string>();
    set.add(key);
    this.importantFlags.set(element, set);
  }

  private extractLifecycle(body: BlockNode): { construct?: BlockNode; destruct?: BlockNode } {
    let construct: BlockNode | undefined;
    let destruct: BlockNode | undefined;
    for (const statement of body.statements) {
      if (!(statement instanceof BlockNode)) {
        continue;
      }
      if (statement.type === "Construct") {
        construct = statement;
      } else if (statement.type === "Destruct") {
        destruct = statement;
      }
    }
    return {
      ...(construct ? { construct } : {}),
      ...(destruct ? { destruct } : {})
    };
  }

  private extractOnBlocks(body: BlockNode): { event: string; body: BlockNode }[] {
    const blocks: { event: string; body: BlockNode }[] = [];
    for (const statement of body.statements) {
      if (statement instanceof OnBlockNode) {
        blocks.push({ event: statement.eventName, body: statement.body });
      }
    }
    return blocks;
  }

  private extractDeclarations(body: BlockNode): DeclarationNode[] {
    const declarations: DeclarationNode[] = [];
    for (const statement of body.statements) {
      if (statement instanceof DeclarationNode) {
        declarations.push(statement);
      }
    }
    return declarations;
  }

  private async applyBehaviorDeclarations(
    element: Element,
    scope: Scope,
    declarations: DeclarationNode[]
  ): Promise<void> {
    for (const declaration of declarations) {
      await this.applyBehaviorDeclaration(element, scope, declaration);
    }
  }

  private async applyBehaviorDeclaration(
    element: Element,
    scope: Scope,
    declaration: DeclarationNode
  ): Promise<void> {
    const context: ExecutionContext = { scope, element };
    const operator = declaration.operator;
    const debounceMs = declaration.flags.debounce
      ? declaration.flagArgs.debounce ?? 200
      : undefined;
    const importantKey = this.getImportantKey(declaration);
    if (!declaration.flags.important && importantKey && this.isImportant(element, importantKey)) {
      return;
    }

    if (declaration.target instanceof IdentifierExpression) {
      const value = await declaration.value.evaluate(context);
      scope.setPath(declaration.target.name, value);
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }

    if (!(declaration.target instanceof DirectiveExpression)) {
      return;
    }

    const target = declaration.target;
    const exprIdentifier =
      declaration.value instanceof IdentifierExpression ? declaration.value.name : undefined;

    if (operator === ":>") {
      if (exprIdentifier) {
        this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs);
      }
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }

    if (operator === ":=" && exprIdentifier) {
      this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs);
    }

    if (!exprIdentifier) {
      const value = await declaration.value.evaluate(context);
      this.setDirectiveValue(element, target, value, declaration.flags.trusted);
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }

    const shouldWatch = operator === ":<" || operator === ":=";
    this.applyDirectiveFromScope(
      element,
      target,
      exprIdentifier,
      scope,
      declaration.flags.trusted,
      debounceMs,
      shouldWatch
    );
    if (declaration.flags.important && importantKey) {
      this.markImportant(element, importantKey);
    }
  }

  private applyDirectiveFromScope(
    element: Element,
    target: DirectiveExpression,
    expr: string,
    scope: Scope,
    trusted: boolean | undefined,
    debounceMs?: number,
    watch = true
  ): void {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const handler = () => applyHtml(element, expr, scope, Boolean(trusted));
      handler();
      if (watch) {
        this.watchWithDebounce(scope, expr, handler, debounceMs);
      }
      return;
    }
    const handler = () => {
      const value = scope.get(expr);
      if (value == null) {
        return;
      }
      this.setDirectiveValue(element, target, value, trusted);
    };
    handler();
    if (watch) {
      this.watchWithDebounce(scope, expr, handler, debounceMs);
    }
  }

  private applyDirectiveToScope(
    element: Element,
    target: DirectiveExpression,
    expr: string,
    scope: Scope,
    debounceMs?: number
  ): void {
    if (target.kind === "attr" && target.name === "value") {
      this.applyValueBindingToScope(element, expr, debounceMs);
      return;
    }
    const value = this.getDirectiveValue(element, target);
    if (value != null) {
      scope.set(expr, value);
    }
  }

  private applyValueBindingToScope(element: Element, expr: string, debounceMs?: number): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const scope = this.getScope(element);
      applyBindToScope(element, expr, scope);
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    effectiveHandler();
    element.addEventListener("input", effectiveHandler);
    element.addEventListener("change", effectiveHandler);
  }

  private setDirectiveValue(
    element: Element,
    target: DirectiveExpression,
    value: unknown,
    trusted: boolean | undefined
  ): void {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const html = value == null ? "" : String(value);
      element.innerHTML = trusted ? html : html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
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
        const checked = Boolean(value);
        element.checked = checked;
        if (checked) {
          element.setAttribute("checked", "");
        } else {
          element.removeAttribute("checked");
        }
        return;
      }
      element.setAttribute(target.name, value == null ? "" : String(value));
      return;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      element.style.setProperty(target.name, value == null ? "" : String(value));
    }
  }

  private getDirectiveValue(element: Element, target: DirectiveExpression): string | undefined {
    if (target.kind === "attr") {
      if (target.name === "value") {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          return element.value;
        }
        if (element instanceof HTMLSelectElement) {
          return element.value;
        }
      }
      if (target.name === "checked" && element instanceof HTMLInputElement) {
        return element.checked ? "true" : "false";
      }
      return element.getAttribute(target.name) ?? undefined;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      return element.style.getPropertyValue(target.name) ?? undefined;
    }
    return undefined;
  }

  private registerDefaultAttributeHandlers(): void {
    this.registerAttributeHandler({
      id: "vsn-bind",
      match: (name) => name.startsWith("vsn-bind"),
      handle: (element, name, value, scope) => {
        const direction = this.parseBindDirection(name);
        this.bindBindings.set(element, { expr: value, direction });
        if (direction === "to" || direction === "both") {
          applyBindToScope(element, value, scope);
          this.attachBindInputHandler(element, value);
        }
        if (direction === "from" || direction === "both") {
          this.watch(scope, value, () => applyBindToElement(element, value, scope));
        }
      }
    });

    this.registerAttributeHandler({
      id: "vsn-if",
      match: (name) => name === "vsn-if",
      handle: (element, _name, value, scope) => {
        this.ifBindings.set(element, value);
        if (element instanceof HTMLElement) {
          applyIf(element, value, scope);
        }
        this.watch(scope, value, () => this.evaluate(element));
      }
    });

    this.registerAttributeHandler({
      id: "vsn-show",
      match: (name) => name === "vsn-show",
      handle: (element, _name, value, scope) => {
        this.showBindings.set(element, value);
        if (element instanceof HTMLElement) {
          applyShow(element, value, scope);
        }
        this.watch(scope, value, () => this.evaluate(element));
      }
    });

    this.registerAttributeHandler({
      id: "vsn-html",
      match: (name) => name.startsWith("vsn-html"),
      handle: (element, name, value, scope) => {
        const trusted = name.includes("!trusted");
        this.htmlBindings.set(element, { expr: value, trusted });
        if (element instanceof HTMLElement) {
          applyHtml(element, value, scope, trusted);
        }
        this.watch(scope, value, () => this.evaluate(element));
      }
    });

    this.registerAttributeHandler({
      id: "vsn-get",
      match: (name) => name.startsWith("vsn-get"),
      handle: (element, name) => {
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
      }
    });

    this.registerAttributeHandler({
      id: "vsn-construct",
      match: (name) => name === "vsn-construct",
      handle: (element, _name, value) => {
        this.setLifecycle(element, { construct: value });
      }
    });

    this.registerAttributeHandler({
      id: "vsn-destruct",
      match: (name) => name === "vsn-destruct",
      handle: (element, _name, value) => {
        this.setLifecycle(element, { destruct: value });
      }
    });

    this.registerAttributeHandler({
      id: "vsn-on",
      match: (name) => name.startsWith("vsn-on:"),
      handle: (element, name, value) => {
        const onConfig = this.parseOnAttribute(name, value);
        if (onConfig) {
          this.attachOnHandler(element, onConfig);
        }
      }
    });
  }
}
