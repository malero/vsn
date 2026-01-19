import { Scope } from "./scope";
import { applyBindToElement, applyBindToScope, BindDirection } from "./bindings";
import { applyIf, applyShow } from "./conditionals";
import { applyHtml } from "./html";
import { applyGet, GetConfig } from "./http";
import { debounce } from "./debounce";
import { Parser } from "../parser/parser";
import {
  AssignmentNode,
  BehaviorNode,
  BlockNode,
  DeclarationNode,
  DirectiveExpression,
  ExecutionContext,
  ExpressionNode,
  FunctionDeclarationNode,
  FunctionParam,
  FunctionExpression,
  ForNode,
  IfNode,
  TryNode,
  IdentifierExpression,
  OnBlockNode,
  UseNode
} from "../ast/nodes";

interface OnConfig {
  event: string;
  code: string;
  debounceMs?: number;
  modifiers?: string[];
  keyModifiers?: string[];
}

interface BindConfig {
  expr: string;
  direction: BindDirection;
  auto?: boolean;
}

interface LifecycleConfig {
  construct?: string;
  destruct?: string;
}

interface RegisteredBehavior {
  id: number;
  selector: string;
  rootSelector: string;
  specificity: number;
  order: number;
  construct?: BlockNode;
  destruct?: BlockNode;
  onBlocks: { event: string; body: BlockNode; modifiers: string[]; args: string[] }[];
  declarations: DeclarationNode[];
  functions: FunctionBinding[];
}

type FunctionBinding = {
  name: string;
  params: FunctionParam[];
  body: BlockNode;
};

type AttributeHandler = {
  id: string;
  match: (name: string) => boolean;
  handle: (element: Element, name: string, value: string, scope: Scope) => boolean | void;
};

type EachBinding = {
  listExpr: string;
  itemName: string;
  indexName?: string;
  rendered: Element[];
};

type CachedBehavior = {
  construct?: BlockNode;
  destruct?: BlockNode;
  onBlocks: { event: string; body: BlockNode; modifiers: string[]; args: string[] }[];
  declarations: DeclarationNode[];
  functions: FunctionBinding[];
};

type BehaviorListener = {
  target: EventTarget;
  event: string;
  handler: (event?: Event) => void;
  options?: AddEventListenerOptions | undefined;
};

type FlagApplyContext = {
  name: string;
  args: any;
  element: Element;
  scope: Scope;
  declaration: DeclarationNode;
};

type FlagHandler = {
  onApply?: (context: FlagApplyContext) => void;
};

type EngineOptions = {
  diagnostics?: boolean;
  logger?: Partial<Pick<Console, "info" | "warn">>;
};

export class Engine {
  private static activeEngines = new WeakMap<Document, Engine>();
  private scopes = new WeakMap<Element, Scope>();
  private bindBindings = new WeakMap<Element, BindConfig>();
  private ifBindings = new WeakMap<Element, string>();
  private showBindings = new WeakMap<Element, string>();
  private htmlBindings = new WeakMap<Element, { expr: string; trusted: boolean }>();
  private getBindings = new WeakMap<Element, GetConfig>();
  private eachBindings = new WeakMap<Element, EachBinding>();
  private lifecycleBindings = new WeakMap<Element, LifecycleConfig>();
  private behaviorRegistry: RegisteredBehavior[] = [];
  private behaviorBindings = new WeakMap<Element, Set<number>>();
  private behaviorListeners = new WeakMap<Element, Map<number, BehaviorListener[]>>();
  private behaviorId = 0;
  private codeCache = new Map<string, BlockNode>();
  private behaviorCache = new Map<string, CachedBehavior>();
  private observer: MutationObserver | undefined;
  private observerRoot: HTMLElement | undefined;
  private attributeHandlers: AttributeHandler[] = [];
  private globals: Record<string, any> = {};
  private importantFlags = new WeakMap<Element, Set<string>>();
  private inlineDeclarations = new WeakMap<Element, Set<string>>();
  private flagHandlers = new Map<string, FlagHandler>();
  private pendingAdded = new Set<Element>();
  private pendingRemoved = new Set<Element>();
  private pendingUpdated = new Set<Element>();
  private observerFlush?: () => void;
  private ignoredAdded = new WeakMap<Element, boolean>();
  private diagnostics: boolean;
  private logger: Partial<Pick<Console, "info" | "warn">>;
  private pendingUses: Promise<void>[] = [];
  private pendingAutoBindToScope: Array<{ element: Element; expr: string; scope: Scope }> = [];
  private scopeWatchers = new WeakMap<Element, { scope: Scope; kind: "path" | "any"; key?: string; handler: () => void }[]>();

  constructor(options: EngineOptions = {}) {
    this.diagnostics = options.diagnostics ?? false;
    this.logger = options.logger ?? console;
    this.registerGlobal("console", console);
    this.registerGlobal("list", {
      async map(items: any[], fn: (item: any, index: number) => any) {
        if (!Array.isArray(items) || typeof fn !== "function") {
          return [];
        }
        const results = [];
        for (let i = 0; i < items.length; i += 1) {
          results.push(await fn(items[i], i));
        }
        return results;
      },
      async filter(items: any[], fn: (item: any, index: number) => any) {
        if (!Array.isArray(items) || typeof fn !== "function") {
          return [];
        }
        const results = [];
        for (let i = 0; i < items.length; i += 1) {
          if (await fn(items[i], i)) {
            results.push(items[i]);
          }
        }
        return results;
      },
      async reduce(items: any[], fn: (acc: any, item: any, index: number) => any, initial?: any) {
        if (!Array.isArray(items) || typeof fn !== "function") {
          return initial;
        }
        const hasInitial = arguments.length > 2;
        let acc = hasInitial ? initial : items[0];
        let start = hasInitial ? 0 : 1;
        for (let i = start; i < items.length; i += 1) {
          acc = await fn(acc, items[i], i);
        }
        return acc;
      }
    });
    this.registerDefaultAttributeHandlers();
  }

  async mount(root: HTMLElement): Promise<void> {
    const documentRoot = root.ownerDocument;
    const active = Engine.activeEngines.get(documentRoot);
    if (active && active !== this) {
      active.disconnectObserver();
    }
    Engine.activeEngines.set(documentRoot, this);
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
    this.disconnectObserver();
  }

  registerBehaviors(source: string): void {
    const program = new Parser(source, { customFlags: new Set(this.flagHandlers.keys()) }).parseProgram();
    for (const use of program.uses) {
      if (use.flags?.wait) {
        this.pendingUses.push(this.waitForUseGlobal(use));
        continue;
      }
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

  registerFlag(name: string, handler: FlagHandler = {}): void {
    const reserved = new Set(["important", "trusted", "debounce"]);
    if (reserved.has(name)) {
      throw new Error(`Flag '${name}' is reserved`);
    }
    this.flagHandlers.set(name, handler);
  }

  getRegistryStats(): { behaviorCount: number; behaviorCacheSize: number } {
    return {
      behaviorCount: this.behaviorRegistry.length,
      behaviorCacheSize: this.behaviorCache.size
    };
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

  private async waitForUses(): Promise<void> {
    while (this.pendingUses.length > 0) {
      const pending = this.pendingUses;
      this.pendingUses = [];
      await Promise.all(pending);
    }
  }

  private waitForUseGlobal(use: UseNode): Promise<void> {
    const config = use.flagArgs?.wait ?? {};
    const timeoutMs = config.timeoutMs ?? 10000;
    const initialDelayMs = config.intervalMs ?? 100;
    const maxDelayMs = 1000;
    const existing = this.resolveGlobalPath(use.name);
    if (existing !== undefined) {
      this.registerGlobal(use.alias, existing);
      return Promise.resolve();
    }
    if (timeoutMs <= 0) {
      this.emitUseError(use.name, new Error(`vsn: global '${use.name}' not found`));
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let elapsedMs = 0;
      let delayMs = initialDelayMs;
      const check = () => {
        const value = this.resolveGlobalPath(use.name);
        if (value !== undefined) {
          this.registerGlobal(use.alias, value);
          resolve();
          return;
        }
        if (elapsedMs >= timeoutMs) {
          this.emitUseError(use.name, new Error(`vsn: global '${use.name}' not found`));
          resolve();
          return;
        }
        const scheduledDelay = Math.min(delayMs, timeoutMs - elapsedMs);
        setTimeout(() => {
          elapsedMs += scheduledDelay;
          delayMs = Math.min(delayMs * 2, maxDelayMs);
          check();
        }, scheduledDelay);
      };
      check();
    });
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
      if (htmlBinding.trusted) {
        this.handleTrustedHtml(element);
      }
    }
  }

  private attachObserver(root: HTMLElement): void {
    if (this.observer) {
      return;
    }
    this.observerRoot = root;
    this.observerFlush = debounce(() => this.flushObserverQueue(), 10);
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          this.pendingUpdated.add(mutation.target);
        }
        for (const node of Array.from(mutation.addedNodes)) {
          if (node && node.nodeType === 1) {
            const element = node as Element;
            if (this.ignoredAdded.has(element)) {
              this.ignoredAdded.delete(element);
              continue;
            }
            this.pendingAdded.add(element);
          }
        }
        for (const node of Array.from(mutation.removedNodes)) {
          if (node && node.nodeType === 1) {
            this.pendingRemoved.add(node as Element);
          }
        }
      }
      this.observerFlush?.();
    });
    this.observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  private disconnectObserver(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.observerRoot = undefined;
    this.pendingAdded.clear();
    this.pendingRemoved.clear();
    this.pendingUpdated.clear();
  }

  private flushObserverQueue(): void {
    const removed = Array.from(this.pendingRemoved);
    this.pendingRemoved.clear();
    for (const node of removed) {
      this.handleRemovedNode(node);
    }
    const updated = Array.from(this.pendingUpdated);
    this.pendingUpdated.clear();
    for (const node of updated) {
      this.handleUpdatedNode(node);
    }
    const added = Array.from(this.pendingAdded);
    this.pendingAdded.clear();
    for (const node of added) {
      this.handleAddedNode(node);
    }
  }

  private handleRemovedNode(node: Element): void {
    if (this.lifecycleBindings.has(node)) {
      this.runDestruct(node);
    }
    if (this.behaviorBindings.has(node)) {
      this.runBehaviorDestruct(node);
    }
    this.cleanupScopeWatchers(node);
    this.cleanupBehaviorListeners(node);
    for (const child of Array.from(node.querySelectorAll("*"))) {
      if (this.lifecycleBindings.has(child)) {
        this.runDestruct(child);
      }
      if (this.behaviorBindings.has(child)) {
        this.runBehaviorDestruct(child);
      }
      this.cleanupScopeWatchers(child);
      this.cleanupBehaviorListeners(child);
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

  private handleUpdatedNode(node: Element): void {
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      void this.reapplyBehaviorsForElement(element);
    }
  }

  private async applyBehaviors(root: Element): Promise<void> {
    await this.waitForUses();
    if (this.behaviorRegistry.length > 0) {
      const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
      for (const element of elements) {
        await this.reapplyBehaviorsForElement(element);
      }
    }
    this.flushAutoBindQueue();
  }

  private async reapplyBehaviorsForElement(element: Element): Promise<void> {
    if (this.behaviorRegistry.length === 0) {
      return;
    }
    const bound = this.behaviorBindings.get(element) ?? new Set<number>();
    const scope = this.getScope(element);
    const matched = this.behaviorRegistry
      .filter((behavior) => element.matches(behavior.selector))
      .sort((a, b) => {
        if (a.specificity !== b.specificity) {
          return a.specificity - b.specificity;
        }
        return a.order - b.order;
      });

    for (const behavior of matched) {
      if (!bound.has(behavior.id)) {
        await this.applyBehaviorForElement(behavior, element, scope, bound);
      }
    }

    const matchedIds = new Set(matched.map((behavior) => behavior.id));
    for (const behavior of this.behaviorRegistry) {
      if (bound.has(behavior.id) && !matchedIds.has(behavior.id)) {
        this.unbindBehaviorForElement(behavior, element, scope, bound);
      }
    }
    this.behaviorBindings.set(element, bound);
  }

  private async applyBehaviorForElement(
    behavior: RegisteredBehavior,
    element: Element,
    scope: Scope,
    bound: Set<number>
  ): Promise<void> {
    bound.add(behavior.id);
    const rootScope = this.getBehaviorRootScope(element, behavior);
    this.applyBehaviorFunctions(element, scope, behavior.functions, rootScope);
    await this.applyBehaviorDeclarations(element, scope, behavior.declarations, rootScope);
    if (behavior.construct) {
      await this.safeExecuteBlock(behavior.construct, scope, element, rootScope);
    }
    for (const onBlock of behavior.onBlocks) {
      this.attachBehaviorOnHandler(
        element,
        onBlock.event,
        onBlock.body,
        onBlock.modifiers,
        onBlock.args,
        behavior.id,
        rootScope
      );
    }
    this.logDiagnostic("bind", element, behavior);
  }

  private unbindBehaviorForElement(
    behavior: RegisteredBehavior,
    element: Element,
    scope: Scope,
    bound: Set<number>
  ): void {
    bound.delete(behavior.id);
    if (behavior.destruct) {
      const rootScope = this.getBehaviorRootScope(element, behavior);
      void this.safeExecuteBlock(behavior.destruct, scope, element, rootScope);
    }
    const listenerMap = this.behaviorListeners.get(element);
    const listeners = listenerMap?.get(behavior.id);
    if (listeners) {
      for (const listener of listeners) {
        listener.target.removeEventListener(listener.event, listener.handler, listener.options);
      }
      listenerMap?.delete(behavior.id);
    }
    this.logDiagnostic("unbind", element, behavior);
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
      const rootScope = this.getBehaviorRootScope(element, behavior);
      void this.safeExecuteBlock(behavior.destruct, scope, element, rootScope);
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
    void this.safeExecute(config.construct, scope, element);
  }

  private runDestruct(element: Element): void {
    const config = this.lifecycleBindings.get(element);
    if (!config?.destruct) {
      return;
    }
    const scope = this.getScope(element);
    void this.safeExecute(config.destruct, scope, element);
  }

  private parseEachExpression(value: string): { listExpr: string; itemName: string; indexName?: string } | null {
    const [listPart, rest] = value.split(/\s+as\s+/);
    if (!listPart || !rest) {
      return null;
    }
    const listExpr = listPart.trim();
    const names = rest.split(",").map((entry) => entry.trim()).filter(Boolean);
    if (!listExpr || names.length === 0) {
      return null;
    }
    const itemName = names[0] ?? "";
    const indexName = names[1];
    return { listExpr, itemName, ...(indexName ? { indexName } : {}) };
  }

  private renderEach(element: Element): void {
    const binding = this.eachBindings.get(element);
    if (!binding) {
      return;
    }
    if (!(element instanceof HTMLTemplateElement)) {
      return;
    }
    const parent = element.parentElement;
    if (!parent) {
      return;
    }

    for (const node of binding.rendered) {
      this.handleRemovedNode(node);
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    binding.rendered = [];

    const scope = this.getScope(element);
    const list = scope.get(binding.listExpr);
    if (!Array.isArray(list)) {
      return;
    }

    const rendered: Element[] = [];
    console.log('renderEach list', list);
    list.forEach((item, index) => {
      const fragment = element.content.cloneNode(true) as DocumentFragment;
      const roots = Array.from(fragment.children) as Element[];
      const itemScope = new Scope(scope);
      itemScope.isEachItem = true;
      itemScope.setPath(`self.${binding.itemName}`, item);
      if (binding.indexName) {
        itemScope.setPath(`self.${binding.indexName}`, index);
      }
      for (const root of roots) {
        this.getScope(root, itemScope);
      }
      parent.insertBefore(fragment, element);
      for (const root of roots) {
        this.ignoredAdded.set(root, true);
        rendered.push(root);
        this.handleAddedNode(root);
        this.evaluate(root);
        for (const child of Array.from(root.querySelectorAll("*"))) {
          this.evaluate(child);
        }
      }
    });
    binding.rendered = rendered;
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
    return "auto";
  }

  private resolveBindConfig(element: Element, expr: string, scope: Scope, direction: BindDirection): {
    direction: BindDirection;
    seedFromScope: boolean;
    syncToScope: boolean;
    deferToScope: boolean;
  } {
    if (direction !== "auto") {
      return {
        direction,
        seedFromScope: false,
        syncToScope: direction === "to" || direction === "both",
        deferToScope: false
      };
    }

    if (this.isInEachScope(scope)) {
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: false };
    }

    if (this.isFormControl(element)) {
      if (this.hasScopeValue(scope, expr)) {
        return { direction: "both", seedFromScope: true, syncToScope: false, deferToScope: false };
      }
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: true };
    }

    if (this.hasScopeValue(scope, expr)) {
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: false };
    }

    if (this.hasElementValue(element)) {
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: true };
    }

    return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: false };
  }

  private isFormControl(element: Element): boolean {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
  }

  private hasScopeValue(scope: Scope, expr: string): boolean {
    const key = expr.trim();
    if (!key) {
      return false;
    }
    const value = scope.get(key);
    return value !== undefined && value !== null;
  }

  private hasElementValue(element: Element): boolean {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
      return element.value.length > 0;
    }
    return (element.textContent ?? "").trim().length > 0;
  }

  private isInEachScope(scope: Scope): boolean {
    let cursor: Scope | undefined = scope;
    while (cursor) {
      if (cursor.isEachItem) {
        return true;
      }
      cursor = cursor.parent;
    }
    return false;
  }

  private flushAutoBindQueue(): void {
    if (this.pendingAutoBindToScope.length === 0) {
      return;
    }
    const pending = this.pendingAutoBindToScope;
    this.pendingAutoBindToScope = [];
    for (const entry of pending) {
      if (!entry.element.isConnected) {
        continue;
      }
      if (this.hasScopeValue(entry.scope, entry.expr)) {
        continue;
      }
      if (!this.hasElementValue(entry.element)) {
        continue;
      }
      applyBindToScope(entry.element, entry.expr, entry.scope);
    }
  }

  private hasVsnAttributes(element: Element): boolean {
    return element.getAttributeNames().some((name) => name.startsWith("vsn-"));
  }

  private markInlineDeclaration(element: Element, key: string): void {
    const set = this.inlineDeclarations.get(element) ?? new Set<string>();
    set.add(key);
    this.inlineDeclarations.set(element, set);
  }

  private isInlineDeclaration(element: Element, key: string): boolean {
    const set = this.inlineDeclarations.get(element);
    return set ? set.has(key) : false;
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

  private watch(scope: Scope, expr: string, handler: () => void, element?: Element): void {
    const key = expr.trim();
    if (!key) {
      return;
    }
    const root = key.split(".")[0];
    if (!root) {
      return;
    }
    let target: Scope | undefined = scope;
    while (target && !target.hasKey(root)) {
      target = target.parent;
    }
    if (target) {
      target.on(key, handler);
      if (element) {
        this.trackScopeWatcher(element, target, "path", handler, key);
      }
      return;
    }
    let cursor: Scope | undefined = scope;
    while (cursor) {
      cursor.on(key, handler);
      if (element) {
        this.trackScopeWatcher(element, cursor, "path", handler, key);
      }
      cursor = cursor.parent;
    }
  }

  private watchWithDebounce(
    scope: Scope,
    expr: string,
    handler: () => void,
    debounceMs?: number,
    element?: Element
  ): void {
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    this.watch(scope, expr, effectiveHandler, element);
  }

  private watchAllScopes(scope: Scope, handler: () => void, debounceMs?: number, element?: Element): void {
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    let cursor: Scope | undefined = scope;
    while (cursor) {
      cursor.onAny(effectiveHandler);
      if (element) {
        this.trackScopeWatcher(element, cursor, "any", effectiveHandler);
      }
      cursor = cursor.parent;
    }
  }

  private trackScopeWatcher(
    element: Element,
    scope: Scope,
    kind: "path" | "any",
    handler: () => void,
    key?: string
  ): void {
    const watchers = this.scopeWatchers.get(element) ?? [];
    watchers.push({ scope, kind, handler, ...(key ? { key } : {}) });
    this.scopeWatchers.set(element, watchers);
  }

  private cleanupScopeWatchers(element: Element): void {
    const watchers = this.scopeWatchers.get(element);
    if (!watchers) {
      return;
    }
    for (const watcher of watchers) {
      if (watcher.kind === "any") {
        watcher.scope.offAny(watcher.handler);
        continue;
      }
      if (watcher.key) {
        watcher.scope.off(watcher.key, watcher.handler);
      }
    }
    this.scopeWatchers.delete(element);
  }

  private cleanupBehaviorListeners(element: Element): void {
    const listenerMap = this.behaviorListeners.get(element);
    if (!listenerMap) {
      return;
    }
    for (const listeners of listenerMap.values()) {
      for (const listener of listeners) {
        listener.target.removeEventListener(listener.event, listener.handler, listener.options);
      }
    }
    listenerMap.clear();
    this.behaviorListeners.delete(element);
    this.behaviorBindings.delete(element);
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
    const descriptor = this.parseEventDescriptor(event);
    if (!descriptor.event) {
      return null;
    }

    let debounceMs: number | undefined;
    const modifiers: string[] = [];
    for (const flag of flags) {
      if (flag.startsWith("debounce")) {
        const match = flag.match(/debounce\((\d+)\)/);
        debounceMs = match ? Number(match[1]) : 200;
        continue;
      }
      modifiers.push(flag);
    }

    const combinedModifiers = [...modifiers, ...descriptor.modifiers];
    const config: OnConfig = {
      event: descriptor.event,
      code: value,
      ...(debounceMs !== undefined ? { debounceMs } : {}),
      ...(combinedModifiers.length > 0 ? { modifiers: combinedModifiers } : {}),
      ...(descriptor.keyModifiers.length > 0 ? { keyModifiers: descriptor.keyModifiers } : {})
    };
    return config;
  }

  private parseEventDescriptor(raw: string): { event: string; keyModifiers: string[]; modifiers: string[] } {
    const parts = raw.split(".").map((part) => part.trim()).filter(Boolean);
    const event = parts.shift() ?? "";
    const modifiers: string[] = [];
    const keyModifiers: string[] = [];
    const modifierSet = new Set(["outside", "self"]);
    for (const part of parts) {
      if (modifierSet.has(part)) {
        modifiers.push(part);
      } else {
        keyModifiers.push(part);
      }
    }
    return { event, keyModifiers, modifiers };
  }

  private matchesKeyModifiers(event: Event | undefined, keyModifiers?: string[]): boolean {
    if (!keyModifiers || keyModifiers.length === 0) {
      return true;
    }
    if (!(event instanceof KeyboardEvent)) {
      return false;
    }
    const modifierChecks: Record<string, boolean> = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      control: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey
    };
    const keyAliases: Record<string, string> = {
      esc: "escape",
      escape: "escape",
      enter: "enter",
      tab: "tab",
      space: "space",
      spacebar: "space",
      up: "arrowup",
      down: "arrowdown",
      left: "arrowleft",
      right: "arrowright",
      arrowup: "arrowup",
      arrowdown: "arrowdown",
      arrowleft: "arrowleft",
      arrowright: "arrowright",
      delete: "delete",
      backspace: "backspace"
    };
    let key = event.key?.toLowerCase() ?? "";
    if (key === " ") {
      key = "space";
    }

    for (const rawModifier of keyModifiers) {
      const modifier = rawModifier.toLowerCase();
      if (modifier in modifierChecks) {
        if (!modifierChecks[modifier]) {
          return false;
        }
        continue;
      }
      const expectedKey = keyAliases[modifier] ?? modifier;
      if (key !== expectedKey) {
        return false;
      }
    }
    return true;
  }

  private matchesTargetModifiers(element: Element, event: Event | undefined, modifiers?: string[]): boolean {
    if (!modifiers || modifiers.length === 0) {
      return true;
    }
    const target = event?.target;
    if (!target || !(target instanceof Node)) {
      return !modifiers.includes("self") && !modifiers.includes("outside");
    }
    if (modifiers.includes("self") && target !== element) {
      return false;
    }
    if (modifiers.includes("outside") && element.contains(target)) {
      return false;
    }
    return true;
  }

  private describeElement(element: Element): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = element.classList.length > 0 ? `.${Array.from(element.classList).join(".")}` : "";
    return `${tag}${id}${classes}`;
  }

  private logDiagnostic(type: "bind" | "unbind", element: Element, behavior: RegisteredBehavior): void {
    if (!this.diagnostics || !this.logger.info) {
      return;
    }
    this.logger.info(`vsn:${type}`, {
      element: this.describeElement(element),
      selector: behavior.selector,
      behaviorId: behavior.id
    });
  }

  private emitError(element: Element, error: unknown): void {
    const selector = this.describeElement(element);
    this.logger.warn?.("vsn:error", { error, selector });
    element.dispatchEvent(
      new CustomEvent("vsn:error", {
        detail: { error, selector },
        bubbles: true
      })
    );
  }

  private emitUseError(name: string, error: unknown): void {
    const selector = `use:${name}`;
    this.logger.warn?.("vsn:error", { error, selector });
    const target = (globalThis as any).document;
    if (target && typeof target.dispatchEvent === "function") {
      target.dispatchEvent(
        new CustomEvent("vsn:error", {
          detail: { error, selector },
          bubbles: true
        })
      );
    }
  }

  private attachOnHandler(element: Element, config: OnConfig): void {
    const options = this.getListenerOptions(config.modifiers);
    const listenerTarget = config.modifiers?.includes("outside") ? element.ownerDocument : element;
    let effectiveHandler: (event?: Event) => void;
    const handler = async (event?: Event) => {
      if (!element.isConnected) {
        listenerTarget.removeEventListener(config.event, effectiveHandler, options);
        return;
      }
      if (!this.matchesKeyModifiers(event, config.keyModifiers)) {
        return;
      }
      if (!this.matchesTargetModifiers(element, event, config.modifiers)) {
        return;
      }
      this.applyEventModifiers(event, config.modifiers);
      const scope = this.getScope(element);
      try {
        await this.execute(config.code, scope, element);
        this.evaluate(element);
      } catch (error) {
        this.emitError(element, error);
      }
    };
    effectiveHandler = config.debounceMs ? debounce(handler, config.debounceMs) : handler;
    listenerTarget.addEventListener(config.event, effectiveHandler, options);
  }

  private attachBehaviorOnHandler(
    element: Element,
    event: string,
    body: BlockNode,
    modifiers: string[] | undefined,
    args: string[] | undefined,
    behaviorId: number,
    rootScope?: Scope
  ): void {
    const descriptor = this.parseEventDescriptor(event);
    const combinedModifiers = modifiers
      ? [...modifiers, ...descriptor.modifiers]
      : descriptor.modifiers.length > 0
        ? [...descriptor.modifiers]
        : undefined;
    const listenerTarget = combinedModifiers?.includes("outside") ? element.ownerDocument : element;
    const handler = async (evt?: Event) => {
      if (!this.matchesKeyModifiers(evt, descriptor.keyModifiers)) {
        return;
      }
      if (!this.matchesTargetModifiers(element, evt, combinedModifiers)) {
        return;
      }
      this.applyEventModifiers(evt, combinedModifiers);
      const scope = this.getScope(element);
      const previousValues = new Map<string, any>();
      if (args && args.length > 0) {
        const argName = args[0];
        if (argName) {
          previousValues.set(argName, scope.getPath(argName));
          scope.setPath(argName, evt);
        }
      }
      let failed = false;
      try {
        await this.executeBlock(body, scope, element, rootScope);
      } catch (error) {
        failed = true;
        this.emitError(element, error);
      } finally {
        for (const [name, value] of previousValues.entries()) {
          scope.setPath(name, value);
        }
      }
      if (!failed) {
        this.evaluate(element);
      }
    };
    const options = this.getListenerOptions(combinedModifiers);
    listenerTarget.addEventListener(descriptor.event, handler, options);
    const listenerMap = this.behaviorListeners.get(element) ?? new Map<number, BehaviorListener[]>();
    const listeners = listenerMap.get(behaviorId) ?? [];
    listeners.push({ target: listenerTarget, event: descriptor.event, handler, options });
    listenerMap.set(behaviorId, listeners);
    this.behaviorListeners.set(element, listenerMap);
  }

  private attachGetHandler(element: Element, autoLoad = false): void {
    const handler = async () => {
      const config = this.getBindings.get(element);
      if (!config) {
        return;
      }
      try {
        await applyGet(element, config, this.getScope(element), (target) => {
          if (config.trusted) {
            this.handleTrustedHtml(target);
          }
        });
      } catch (error) {
        console.warn("vsn:getError", error);
        element.dispatchEvent(new CustomEvent("vsn:getError", { detail: { error }, bubbles: true }));
      }
    };

    element.addEventListener("click", (event) => {
      if (event.target !== element) {
        return;
      }
      void handler();
    });
    if (autoLoad) {
      Promise.resolve().then(handler);
    }
  }

  private applyEventModifiers(event: Event | undefined, modifiers?: string[]): void {
    if (!event || !modifiers || modifiers.length === 0) {
      return;
    }
    for (const modifier of modifiers) {
      if (modifier === "prevent") {
        event.preventDefault();
      } else if (modifier === "stop") {
        event.stopPropagation();
      }
    }
  }

  private getListenerOptions(modifiers?: string[]): AddEventListenerOptions | undefined {
    if (!modifiers || modifiers.length === 0) {
      return undefined;
    }
    const options: AddEventListenerOptions = {};
    if (modifiers.includes("once")) {
      options.once = true;
    }
    if (modifiers.includes("passive")) {
      options.passive = true;
    }
    if (modifiers.includes("capture")) {
      options.capture = true;
    }
    return Object.keys(options).length > 0 ? options : undefined;
  }

  private async execute(code: string, scope: Scope, element?: Element, rootScope?: Scope): Promise<void> {
    let block = this.codeCache.get(code);
    if (!block) {
      block = Parser.parseInline(code);
      this.codeCache.set(code, block);
    }
    const context: ExecutionContext = {
      scope,
      rootScope,
      globals: this.globals,
      ...(element ? { element } : {})
    };
    await block.evaluate(context);
  }

  private async executeBlock(block: BlockNode, scope: Scope, element?: Element, rootScope?: Scope): Promise<void> {
    const context: ExecutionContext = {
      scope,
      rootScope,
      globals: this.globals,
      ...(element ? { element } : {})
    };
    await block.evaluate(context);
  }

  private async safeExecute(code: string, scope: Scope, element?: Element, rootScope?: Scope): Promise<void> {
    try {
      await this.execute(code, scope, element, rootScope);
    } catch (error) {
      if (element) {
        this.emitError(element, error);
      }
    }
  }

  private async safeExecuteBlock(
    block: BlockNode,
    scope: Scope,
    element?: Element,
    rootScope?: Scope
  ): Promise<void> {
    try {
      await this.executeBlock(block, scope, element, rootScope);
    } catch (error) {
      if (element) {
        this.emitError(element, error);
      }
    }
  }

  private collectBehavior(behavior: BehaviorNode, parentSelector?: string, rootSelectorOverride?: string): void {
    const selector = parentSelector
      ? `${parentSelector} ${behavior.selector.selectorText}`
      : behavior.selector.selectorText;
    const rootSelector = rootSelectorOverride ?? (parentSelector ?? behavior.selector.selectorText);
    const cached = this.getCachedBehavior(behavior);
    this.behaviorRegistry.push({
      id: this.behaviorId += 1,
      selector,
      rootSelector,
      specificity: this.computeSpecificity(selector),
      order: this.behaviorRegistry.length,
      ...cached
    });
    this.collectNestedBehaviors(behavior.body, selector, rootSelector);
  }

  private collectNestedBehaviors(block: BlockNode, parentSelector: string, rootSelector: string): void {
    for (const statement of block.statements) {
      if (statement instanceof BehaviorNode) {
        this.collectBehavior(statement, parentSelector, rootSelector);
        continue;
      }
      if (statement instanceof OnBlockNode) {
        this.collectNestedBehaviors(statement.body, parentSelector, rootSelector);
        continue;
      }
      if (statement instanceof BlockNode) {
        this.collectNestedBehaviors(statement, parentSelector, rootSelector);
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

  private getBehaviorRootScope(element: Element, behavior: RegisteredBehavior): Scope {
    const rootElement = element.closest(behavior.rootSelector) ?? element;
    return this.getScope(rootElement);
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

  private extractOnBlocks(body: BlockNode): { event: string; body: BlockNode; modifiers: string[]; args: string[] }[] {
    const blocks: { event: string; body: BlockNode; modifiers: string[]; args: string[] }[] = [];
    for (const statement of body.statements) {
      if (statement instanceof OnBlockNode) {
        blocks.push({
          event: statement.eventName,
          body: statement.body,
          modifiers: statement.modifiers,
          args: statement.args
        });
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

  private extractFunctionDeclarations(body: BlockNode): FunctionBinding[] {
    const functions: FunctionBinding[] = [];
    for (const statement of body.statements) {
      if (statement instanceof FunctionDeclarationNode) {
        functions.push({ name: statement.name, params: statement.params, body: statement.body });
        continue;
      }
      if (statement instanceof AssignmentNode) {
        if (statement.target instanceof IdentifierExpression && statement.value instanceof FunctionExpression) {
          functions.push({
            name: statement.target.name,
            params: statement.value.params,
            body: statement.value.body
          });
        }
      }
    }
    return functions;
  }

  private getCachedBehavior(behavior: BehaviorNode): CachedBehavior {
    const hash = this.hashBehavior(behavior);
    const cached = this.behaviorCache.get(hash);
    if (cached) {
      return cached;
    }
    const lifecycle = this.extractLifecycle(behavior.body);
    const fresh: CachedBehavior = {
      onBlocks: this.extractOnBlocks(behavior.body),
      declarations: this.extractDeclarations(behavior.body),
      functions: this.extractFunctionDeclarations(behavior.body),
      ...lifecycle
    };
    this.behaviorCache.set(hash, fresh);
    return fresh;
  }

  private hashBehavior(behavior: BehaviorNode): string {
    const normalized = this.normalizeNode(behavior);
    const json = JSON.stringify(normalized);
    return this.hashString(json);
  }

  private normalizeNode(node: any): any {
    if (!node || typeof node !== "object") {
      return node;
    }
    const type = node.type ?? "Unknown";
    if (type === "Behavior") {
      return {
        type,
        selector: node.selector?.selectorText ?? "",
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "Selector") {
      return { type, selectorText: node.selectorText ?? "" };
    }
    if (type === "Block" || type === "Construct" || type === "Destruct") {
      return {
        type,
        statements: Array.isArray(node.statements)
          ? node.statements.map((statement: any) => this.normalizeNode(statement))
          : []
      };
    }
    if (type === "OnBlock") {
      return {
        type,
        eventName: node.eventName ?? "",
        args: Array.isArray(node.args) ? node.args : [],
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "Declaration") {
      return {
        type,
        target: this.normalizeNode(node.target),
        operator: node.operator ?? "",
        value: this.normalizeNode(node.value),
        flags: node.flags ?? {},
        flagArgs: node.flagArgs ?? {}
      };
    }
    if (type === "Assignment") {
      return {
        type,
        target: this.normalizeNode(node.target),
        value: this.normalizeNode(node.value)
      };
    }
    if (type === "StateBlock") {
      return {
        type,
        entries: Array.isArray(node.entries)
          ? node.entries.map((entry: any) => this.normalizeNode(entry))
          : []
      };
    }
    if (type === "StateEntry") {
      return {
        type,
        name: node.name ?? "",
        value: this.normalizeNode(node.value),
        important: Boolean(node.important)
      };
    }
    if (type === "FunctionDeclaration") {
      return {
        type,
        name: node.name ?? "",
        params: Array.isArray(node.params)
          ? node.params.map((param: any) => ({
            name: param?.name ?? "",
            rest: Boolean(param?.rest),
            defaultValue: this.normalizeNode(param?.defaultValue ?? null)
          }))
          : [],
        body: this.normalizeNode(node.body),
        isAsync: Boolean(node.isAsync)
      };
    }
    if (type === "FunctionExpression") {
      return {
        type,
        params: Array.isArray(node.params)
          ? node.params.map((param: any) => ({
            name: param?.name ?? "",
            rest: Boolean(param?.rest),
            defaultValue: this.normalizeNode(param?.defaultValue ?? null)
          }))
          : [],
        body: this.normalizeNode(node.body),
        isAsync: Boolean(node.isAsync)
      };
    }
    if (type === "Return") {
      return {
        type,
        value: this.normalizeNode(node.value ?? null)
      };
    }
    if (type === "If") {
      return {
        type,
        test: this.normalizeNode(node.test),
        consequent: this.normalizeNode(node.consequent),
        alternate: this.normalizeNode(node.alternate ?? null)
      };
    }
    if (type === "While") {
      return {
        type,
        test: this.normalizeNode(node.test),
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "For") {
      return {
        type,
        init: this.normalizeNode(node.init ?? null),
        test: this.normalizeNode(node.test ?? null),
        update: this.normalizeNode(node.update ?? null),
        body: this.normalizeNode(node.body)
      };
    }
    if (type === "Try") {
      return {
        type,
        errorName: node.errorName ?? "",
        body: this.normalizeNode(node.body),
        handler: this.normalizeNode(node.handler)
      };
    }
    if (type === "Identifier") {
      return { type, name: node.name ?? "" };
    }
    if (type === "Literal") {
      return { type, value: node.value };
    }
    if (type === "TemplateExpression") {
      return {
        type,
        parts: Array.isArray(node.parts) ? node.parts.map((part: any) => this.normalizeNode(part)) : []
      };
    }
    if (type === "UnaryExpression") {
      return {
        type,
        operator: node.operator ?? "",
        argument: this.normalizeNode(node.argument)
      };
    }
    if (type === "BinaryExpression") {
      return {
        type,
        operator: node.operator ?? "",
        left: this.normalizeNode(node.left),
        right: this.normalizeNode(node.right)
      };
    }
    if (type === "TernaryExpression") {
      return {
        type,
        test: this.normalizeNode(node.test),
        consequent: this.normalizeNode(node.consequent),
        alternate: this.normalizeNode(node.alternate)
      };
    }
    if (type === "MemberExpression") {
      return {
        type,
        target: this.normalizeNode(node.target),
        property: node.property ?? "",
        optional: Boolean(node.optional)
      };
    }
    if (type === "CallExpression") {
      return {
        type,
        callee: this.normalizeNode(node.callee),
        args: Array.isArray(node.args) ? node.args.map((arg: any) => this.normalizeNode(arg)) : []
      };
    }
    if (type === "AwaitExpression") {
      return {
        type,
        argument: this.normalizeNode(node.argument)
      };
    }
    if (type === "Directive") {
      return { type, kind: node.kind ?? "", name: node.name ?? "" };
    }
    if (type === "Query") {
      return { type, direction: node.direction ?? "", selector: node.selector ?? "" };
    }
    if (type === "ArrayExpression") {
      return {
        type,
        elements: Array.isArray(node.elements)
          ? node.elements.map((element: any) => this.normalizeNode(element))
          : []
      };
    }
    if (type === "ObjectExpression") {
      return {
        type,
        entries: Array.isArray(node.entries)
          ? node.entries.map((entry: any) => ({
              key: entry?.key ?? "",
              computed: Boolean(entry?.computed),
              keyExpr: entry?.keyExpr ? this.normalizeNode(entry.keyExpr) : null,
              value: this.normalizeNode(entry?.value)
            }))
          : []
      };
    }
    if (type === "IndexExpression") {
      return {
        type,
        target: this.normalizeNode(node.target),
        index: this.normalizeNode(node.index)
      };
    }
    return { type };
  }

  private hashString(value: string): string {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) + hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  }

  private applyBehaviorFunctions(
    element: Element,
    scope: Scope,
    functions: FunctionBinding[],
    rootScope?: Scope
  ): void {
    for (const declaration of functions) {
      this.applyBehaviorFunction(element, scope, declaration, rootScope);
    }
  }

  private applyBehaviorFunction(
    element: Element,
    scope: Scope,
    declaration: FunctionBinding,
    rootScope?: Scope
  ): void {
    const existing = scope.getPath(declaration.name);
    if (existing !== undefined && typeof existing !== "function") {
      throw new Error(`Cannot override non-function '${declaration.name}' with a function`);
    }
    const fn = async (...args: any[]) => {
      const callScope = scope.createChild ? scope.createChild() : scope;
      const context: ExecutionContext = {
        scope: callScope,
        rootScope: rootScope ?? callScope,
        globals: this.globals,
        element,
        returnValue: undefined,
        returning: false
      };
      const previousValues = new Map<string, any>();
      await this.applyFunctionParams(callScope, declaration.params, previousValues, context, args);
      await declaration.body.evaluate(context);
      if (callScope === scope) {
        this.restoreFunctionParams(callScope, declaration.params, previousValues);
      }
      return context.returnValue;
    };
    scope.setPath(declaration.name, fn);
  }

  private async applyFunctionParams(
    scope: Scope,
    params: FunctionParam[],
    previousValues: Map<string, any>,
    context: ExecutionContext,
    args: any[]
  ): Promise<void> {
    let argIndex = 0;
    for (const param of params) {
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

  private restoreFunctionParams(
    scope: Scope,
    params: FunctionParam[],
    previousValues: Map<string, any>
  ): void {
    for (const param of params) {
      const name = param.name;
      if (!name) {
        continue;
      }
      scope.setPath(name, previousValues.get(name));
    }
  }

  private async applyBehaviorDeclarations(
    element: Element,
    scope: Scope,
    declarations: DeclarationNode[],
    rootScope?: Scope
  ): Promise<void> {
    for (const declaration of declarations) {
      await this.applyBehaviorDeclaration(element, scope, declaration, rootScope);
    }
  }

  private async applyBehaviorDeclaration(
    element: Element,
    scope: Scope,
    declaration: DeclarationNode,
    rootScope?: Scope
  ): Promise<void> {
    const context: ExecutionContext = { scope, rootScope, element };
    const operator = declaration.operator;
    const debounceMs = declaration.flags.debounce
      ? declaration.flagArgs.debounce ?? 200
      : undefined;
    const importantKey = this.getImportantKey(declaration);
    if (!declaration.flags.important && importantKey && this.isImportant(element, importantKey)) {
      return;
    }
    if (importantKey && this.isInlineDeclaration(element, importantKey)) {
      return;
    }
    this.applyCustomFlags(element, scope, declaration);

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
        this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope);
      }
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }

    if (operator === ":=" && exprIdentifier) {
      this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope);
    }

    if (!exprIdentifier) {
      const value = await declaration.value.evaluate(context);
      this.setDirectiveValue(element, target, value, declaration.flags.trusted);
      const shouldWatch = operator === ":<" || operator === ":=";
      if (shouldWatch) {
        this.applyDirectiveFromExpression(
          element,
          target,
          declaration.value,
          scope,
          declaration.flags.trusted,
          debounceMs,
          rootScope
        );
      }
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
      shouldWatch,
      rootScope
    );
    if (declaration.flags.important && importantKey) {
      this.markImportant(element, importantKey);
    }
  }

  private applyCustomFlags(element: Element, scope: Scope, declaration: DeclarationNode): void {
    if (this.flagHandlers.size === 0) {
      return;
    }
    for (const [name, handler] of this.flagHandlers) {
      if (!declaration.flags[name]) {
        continue;
      }
      handler.onApply?.({
        name,
        args: declaration.flagArgs[name],
        element,
        scope,
        declaration
      });
    }
  }

  private applyDirectiveFromScope(
    element: Element,
    target: DirectiveExpression,
    expr: string,
    scope: Scope,
    trusted: boolean | undefined,
    debounceMs?: number,
    watch = true,
    rootScope?: Scope
  ): void {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const handler = () => {
        const useRoot = expr.startsWith("root.") && rootScope;
        const sourceScope = useRoot ? rootScope : scope;
        const localExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
        applyHtml(element, localExpr, sourceScope, Boolean(trusted));
      };
      handler();
      if (trusted) {
        this.handleTrustedHtml(element);
      }
      if (watch) {
        const useRoot = expr.startsWith("root.") && rootScope;
        const sourceScope = useRoot ? rootScope : scope;
        const watchExpr = useRoot ? expr.slice("root.".length) : expr;
        this.watchWithDebounce(sourceScope, watchExpr, handler, debounceMs, element);
      }
      return;
    }
    const handler = () => {
      const useRoot = expr.startsWith("root.") && rootScope;
      const sourceScope = useRoot ? rootScope : scope;
      const localExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
      const value = sourceScope.get(localExpr);
      if (value == null) {
        return;
      }
      this.setDirectiveValue(element, target, value, trusted);
    };
    handler();
    if (watch) {
      const useRoot = expr.startsWith("root.") && rootScope;
      const sourceScope = useRoot ? rootScope : scope;
      const watchExpr = useRoot ? expr.slice("root.".length) : expr;
      this.watchWithDebounce(sourceScope, watchExpr, handler, debounceMs, element);
    }
  }

  private applyDirectiveFromExpression(
    element: Element,
    target: DirectiveExpression,
    expr: ExpressionNode,
    scope: Scope,
    trusted: boolean | undefined,
    debounceMs?: number,
    rootScope?: Scope
  ): void {
    const handler = async () => {
      const context: ExecutionContext = { scope, rootScope, element };
      const value = await expr.evaluate(context);
      this.setDirectiveValue(element, target, value, trusted);
    };
    void handler();
    this.watchAllScopes(scope, () => {
      void handler();
    }, debounceMs, element);
  }

  private applyDirectiveToScope(
    element: Element,
    target: DirectiveExpression,
    expr: string,
    scope: Scope,
    debounceMs?: number,
    rootScope?: Scope
  ): void {
    const useRoot = expr.startsWith("root.") && rootScope;
    const targetScope = useRoot ? rootScope : scope;
    const targetExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
    if (target.kind === "attr" && target.name === "value") {
      this.applyValueBindingToScope(element, targetExpr, debounceMs, targetScope);
      return;
    }
    if (target.kind === "attr" && target.name === "checked") {
      this.applyCheckedBindingToScope(element, targetExpr, debounceMs, targetScope);
      return;
    }
    const value = this.getDirectiveValue(element, target);
    if (value != null) {
      targetScope.set(targetExpr, value);
    }
  }

  private applyCheckedBindingToScope(
    element: Element,
    expr: string,
    debounceMs?: number,
    scope?: Scope
  ): void {
    if (!(element instanceof HTMLInputElement)) {
      return;
    }
    const handler = () => {
      const targetScope = scope ?? this.getScope(element);
      targetScope.set(expr, element.checked);
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    effectiveHandler();
    element.addEventListener("change", effectiveHandler);
    element.addEventListener("input", effectiveHandler);
  }

  private applyValueBindingToScope(
    element: Element,
    expr: string,
    debounceMs?: number,
    scope?: Scope
  ): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const targetScope = scope ?? this.getScope(element);
      applyBindToScope(element, expr, targetScope);
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
      if (trusted) {
        this.handleTrustedHtml(element);
      }
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
      element.setAttribute(target.name, value == null ? "" : String(value));
      return;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      element.style.setProperty(target.name, value == null ? "" : String(value));
    }
  }

  private getDirectiveValue(element: Element, target: DirectiveExpression): unknown {
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
        return element.checked;
      }
      return element.getAttribute(target.name) ?? undefined;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      return element.style.getPropertyValue(target.name) ?? undefined;
    }
    return undefined;
  }

  private handleTrustedHtml(root: Element): void {
    const scripts = Array.from(root.querySelectorAll('script[type="text/vsn"]'));
    if (scripts.length === 0) {
      return;
    }
    const source = scripts.map((script) => script.textContent ?? "").join("\n");
    if (!source.trim()) {
      return;
    }
    this.registerBehaviors(source);
    void this.applyBehaviors(root);
  }

  private registerDefaultAttributeHandlers(): void {
    this.registerAttributeHandler({
      id: "vsn-bind",
      match: (name) => name.startsWith("vsn-bind"),
      handle: (element, name, value, scope) => {
        const parsedDirection = this.parseBindDirection(name);
        const config = this.resolveBindConfig(element, value, scope, parsedDirection);
        const direction = config.direction;
        const auto = parsedDirection === "auto";
        this.bindBindings.set(element, { expr: value, direction, auto });
        if (!auto && (direction === "to" || direction === "both")) {
          this.markInlineDeclaration(element, `state:${value}`);
        }
        if (config.seedFromScope) {
          applyBindToElement(element, value, scope);
        }
        if (config.deferToScope) {
          this.pendingAutoBindToScope.push({ element, expr: value, scope });
        } else if (config.syncToScope) {
          applyBindToScope(element, value, scope);
        }
        if (direction === "to" || direction === "both") {
          this.attachBindInputHandler(element, value);
        }
        if (direction === "from" || direction === "both") {
          this.watch(scope, value, () => applyBindToElement(element, value, scope), element);
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
        this.watch(scope, value, () => this.evaluate(element), element);
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
        this.watch(scope, value, () => this.evaluate(element), element);
      }
    });

    this.registerAttributeHandler({
      id: "vsn-html",
      match: (name) => name.startsWith("vsn-html"),
      handle: (element, name, value, scope) => {
        const trusted = name.includes("!trusted");
        this.htmlBindings.set(element, { expr: value, trusted });
        this.markInlineDeclaration(element, "attr:html");
        if (element instanceof HTMLElement) {
          applyHtml(element, value, scope, trusted);
          if (trusted) {
            this.handleTrustedHtml(element);
          }
        }
        this.watch(scope, value, () => this.evaluate(element), element);
      }
    });

    this.registerAttributeHandler({
      id: "vsn-each",
      match: (name) => name === "vsn-each",
      handle: (element, _name, value, scope) => {
        const config = this.parseEachExpression(value);
        if (!config) {
          return;
        }
        this.eachBindings.set(element, { ...config, rendered: [] });
        this.renderEach(element);
        this.watch(scope, config.listExpr, () => this.renderEach(element), element);
      }
    });

    this.registerAttributeHandler({
      id: "vsn-get",
      match: (name) => name.startsWith("vsn-get"),
      handle: (element, name) => {
        const trusted = name.includes("!trusted");
        const autoLoad = name.includes("!load");
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
        this.attachGetHandler(element, autoLoad);
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
