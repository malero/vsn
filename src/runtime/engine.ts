import { Scope } from "./scope";
import { applyBindToElement, applyBindToScope, BindDirection } from "./bindings";
import { applyIf, applyShow } from "./conditionals";
import { applyHtml } from "./html";
import { applyGet, GetConfig } from "./http";
import { debounce } from "./debounce";
import { Parser } from "../parser/parser";
import { BehaviorNode, BlockNode, ExecutionContext, OnBlockNode } from "../ast/nodes";

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
  construct?: BlockNode;
  destruct?: BlockNode;
  onBlocks: { event: string; body: BlockNode }[];
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

  constructor() {
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
    for (const behavior of program.behaviors) {
      this.collectBehavior(behavior);
    }
  }

  registerAttributeHandler(handler: AttributeHandler): void {
    this.attributeHandlers.push(handler);
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

  private async applyBehaviors(root: HTMLElement): Promise<void> {
    if (this.behaviorRegistry.length === 0) {
      return;
    }
    for (const behavior of this.behaviorRegistry) {
      const matches: Element[] = [];
      if (root.matches(behavior.selector)) {
        matches.push(root);
      }
      matches.push(...Array.from(root.querySelectorAll(behavior.selector)));
      for (const element of matches) {
        const bound = this.behaviorBindings.get(element) ?? new Set<number>();
        if (bound.has(behavior.id)) {
          continue;
        }
        bound.add(behavior.id);
        this.behaviorBindings.set(element, bound);
        const scope = this.getScope(element);
        if (behavior.construct) {
          await this.executeBlock(behavior.construct, scope);
        }
        for (const onBlock of behavior.onBlocks) {
          this.attachBehaviorOnHandler(element, onBlock.event, onBlock.body);
        }
      }
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
      void this.executeBlock(behavior.destruct, scope);
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
    this.execute(config.construct, scope);
  }

  private runDestruct(element: Element): void {
    const config = this.lifecycleBindings.get(element);
    if (!config?.destruct) {
      return;
    }
    const scope = this.getScope(element);
    this.execute(config.destruct, scope);
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
      await this.execute(config.code, scope);
      this.evaluate(element);
    };
    const effectiveHandler = config.debounceMs ? debounce(handler, config.debounceMs) : handler;
    element.addEventListener(config.event, effectiveHandler);
  }

  private attachBehaviorOnHandler(element: Element, event: string, body: BlockNode): void {
    const handler = async () => {
      const scope = this.getScope(element);
      await this.executeBlock(body, scope);
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

  private async execute(code: string, scope: Scope): Promise<void> {
    let block = this.codeCache.get(code);
    if (!block) {
      block = Parser.parseInline(code);
      this.codeCache.set(code, block);
    }
    const context: ExecutionContext = { scope };
    await block.evaluate(context);
  }

  private async executeBlock(block: BlockNode, scope: Scope): Promise<void> {
    const context: ExecutionContext = { scope };
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
      onBlocks: this.extractOnBlocks(behavior.body),
      ...lifecycle
    });
    for (const statement of behavior.body.statements) {
      if (statement instanceof BehaviorNode) {
        this.collectBehavior(statement, selector);
      }
    }
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
