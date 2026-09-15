import { Scope } from "./scope";
import { applyBindToElement, applyBindToScope, BindDirection } from "./bindings";
import { applyIf, applyShow } from "./conditionals";
import { applyGet, GetConfig } from "./http";
import { debounce } from "./debounce";
import { Parser } from "../parser/parser";
import {
  AssignmentNode,
  BehaviorNode,
  BehaviorFlags,
  BehaviorFlagArgs,
  BlockNode,
  DeclarationFlags,
  DeclarationFlagArgs,
  DeclarationNode,
  DirectiveExpression,
  ExecutionContext,
  ExpressionNode,
  FunctionDeclarationNode,
  FunctionParam,
  FunctionExpression,
  IdentifierExpression,
  OnBlockNode,
  UseNode
} from "../ast/nodes";

interface OnConfig {
  event: string;
  code: string;
  flags: DeclarationFlags;
  flagArgs: DeclarationFlagArgs;
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

export interface RegisteredBehavior {
  id: number;
  hash: string;
  selector: string;
  rootSelector: string;
  parentSelector?: string;
  specificity: number;
  order: number;
  construct?: BlockNode;
  destruct?: BlockNode;
  onBlocks: { event: string; body: BlockNode; flags: DeclarationFlags; flagArgs: DeclarationFlagArgs; args: string[] }[];
  declarations: DeclarationNode[];
  functions: FunctionBinding[];
  flags: BehaviorFlags;
  flagArgs: BehaviorFlagArgs;
  persistent: boolean;
  dynamicOwners: Set<Element>;
}

type FunctionBinding = {
  name: string;
  params: FunctionParam[];
  body: BlockNode;
  isAsync: boolean;
};

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return Boolean(value) && typeof (value as PromiseLike<unknown>).then === "function";
}

type SpecificityCounts = {
  ids: number;
  classes: number;
  elements: number;
};

function emptySpecificity(): SpecificityCounts {
  return { ids: 0, classes: 0, elements: 0 };
}

function compareSpecificity(a: SpecificityCounts, b: SpecificityCounts): number {
  return a.ids - b.ids || a.classes - b.classes || a.elements - b.elements;
}

function maxSpecificity(a: SpecificityCounts, b: SpecificityCounts): SpecificityCounts {
  return compareSpecificity(a, b) >= 0 ? a : b;
}

function addSpecificity(target: SpecificityCounts, addition: SpecificityCounts): void {
  target.ids += addition.ids;
  target.classes += addition.classes;
  target.elements += addition.elements;
}

function specificityScore(counts: SpecificityCounts): number {
  // Keep the three CSS specificity columns ordered without letting a large
  // number of type selectors outweigh a class or ID selector.
  return counts.ids * 1_000_000 + counts.classes * 1_000 + counts.elements;
}

function maxSelectorSpecificity(selectors: string[]): SpecificityCounts {
  return selectors.reduce(
    (best, selector) => maxSpecificity(best, computeSelectorSpecificity(selector)),
    emptySpecificity()
  );
}

function splitSelectorList(selector: string): string[] {
  const groups: string[] = [];
  let start = 0;
  let quote = "";
  let escaped = false;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i] ?? "";
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[") {
      bracketDepth += 1;
      continue;
    }
    if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (char === "(") {
      parenDepth += 1;
      continue;
    }
    if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (char === "," && bracketDepth === 0 && parenDepth === 0) {
      const group = selector.slice(start, i).trim();
      if (group) {
        groups.push(group);
      }
      start = i + 1;
    }
  }

  const finalGroup = selector.slice(start).trim();
  if (finalGroup) {
    groups.push(finalGroup);
  }
  return groups;
}

function replaceNestingSelector(
  selector: string,
  parentSelector: string
): { selector: string; replaced: boolean } {
  let result = "";
  let quote = "";
  let bracketDepth = 0;
  let replaced = false;

  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i] ?? "";

    if (quote) {
      result += char;
      if (char === "\\") {
        const escaped = selector[i + 1];
        if (escaped !== undefined) {
          result += escaped;
          i += 1;
        }
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      result += char;
      continue;
    }

    if (char === "\\") {
      result += char;
      const escaped = selector[i + 1];
      if (escaped !== undefined) {
        result += escaped;
        i += 1;
      }
      continue;
    }

    if (char === "[") {
      bracketDepth += 1;
      result += char;
      continue;
    }
    if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      result += char;
      continue;
    }

    if (char === "&" && bracketDepth === 0) {
      result += parentSelector;
      replaced = true;
      continue;
    }

    result += char;
  }

  return { selector: result, replaced };
}

function hasNestingSelector(selector: string): boolean {
  return splitSelectorList(selector).some((group) => replaceNestingSelector(group, "").replaced);
}

function composeNestedSelector(parentSelector: string, nestedSelector: string): string {
  const parentGroups = splitSelectorList(parentSelector);
  const nestedGroups = splitSelectorList(nestedSelector);
  const composedGroups: string[] = [];

  for (const parentGroup of parentGroups) {
    for (const nestedGroup of nestedGroups) {
      const replacement = replaceNestingSelector(nestedGroup, parentGroup);
      composedGroups.push(replacement.replaced
        ? replacement.selector
        : `${parentGroup} ${nestedGroup}`);
    }
  }

  return composedGroups.join(", ");
}

function isSelectorNameChar(char: string | undefined): boolean {
  return Boolean(char && /[A-Za-z0-9_-]/.test(char));
}

function readSelectorName(selector: string, start: number): number {
  let end = start;
  while (end < selector.length) {
    const char = selector[end];
    if (isSelectorNameChar(char)) {
      end += 1;
      continue;
    }
    if (char === "\\" && end + 1 < selector.length) {
      end += 2;
      continue;
    }
    break;
  }
  return end;
}

function readBalancedSelector(
  selector: string,
  start: number,
  open: string,
  close: string
): { content: string; end: number } {
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let i = start; i < selector.length; i += 1) {
    const char = selector[i] ?? "";
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === open) {
      depth += 1;
      continue;
    }
    if (char === close) {
      depth -= 1;
      if (depth === 0) {
        return { content: selector.slice(start + 1, i), end: i + 1 };
      }
    }
  }

  return { content: selector.slice(start + 1), end: selector.length };
}

function findSelectorKeyword(selector: string, keyword: string): number {
  let quote = "";
  let escaped = false;
  let bracketDepth = 0;
  let parenDepth = 0;

  for (let i = 0; i <= selector.length - keyword.length; i += 1) {
    const char = selector[i] ?? "";
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[") {
      bracketDepth += 1;
      continue;
    }
    if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (char === "(") {
      parenDepth += 1;
      continue;
    }
    if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (bracketDepth !== 0 || parenDepth !== 0) {
      continue;
    }
    if (selector.slice(i, i + keyword.length).toLowerCase() !== keyword.toLowerCase()) {
      continue;
    }
    const before = selector[i - 1];
    const after = selector[i + keyword.length];
    if (!isSelectorNameChar(before) && !isSelectorNameChar(after)) {
      return i;
    }
  }
  return -1;
}

function computeSelectorSpecificity(selector: string): SpecificityCounts {
  const counts = emptySpecificity();
  let compoundStart = true;

  for (let i = 0; i < selector.length;) {
    const char = selector[i] ?? "";
    if (/\s/.test(char) || char === ">" || char === "+" || char === "~") {
      compoundStart = true;
      i += 1;
      continue;
    }
    if (char === "*") {
      compoundStart = false;
      i += 1;
      continue;
    }
    if (char === "[") {
      counts.classes += 1;
      const balanced = readBalancedSelector(selector, i, "[", "]");
      i = balanced.end;
      compoundStart = false;
      continue;
    }
    if (char === "#") {
      const end = readSelectorName(selector, i + 1);
      if (end > i + 1) {
        counts.ids += 1;
      }
      i = end;
      compoundStart = false;
      continue;
    }
    if (char === ".") {
      const end = readSelectorName(selector, i + 1);
      if (end > i + 1) {
        counts.classes += 1;
      }
      i = end;
      compoundStart = false;
      continue;
    }
    if (char === ":") {
      const pseudoElement = selector[i + 1] === ":";
      const nameStart = i + (pseudoElement ? 2 : 1);
      const nameEnd = readSelectorName(selector, nameStart);
      const name = selector.slice(nameStart, nameEnd).toLowerCase();
      i = nameEnd;
      if (pseudoElement) {
        counts.elements += 1;
      } else if (name === "where" && selector[i] === "(") {
        const balanced = readBalancedSelector(selector, i, "(", ")");
        i = balanced.end;
      } else if (name === "is" || name === "not" || name === "has") {
        if (selector[i] === "(") {
          const balanced = readBalancedSelector(selector, i, "(", ")");
          const argumentSpecificity = maxSelectorSpecificity(splitSelectorList(balanced.content));
          addSpecificity(counts, argumentSpecificity);
          i = balanced.end;
        }
      } else {
        counts.classes += 1;
        if (selector[i] === "(") {
          const balanced = readBalancedSelector(selector, i, "(", ")");
          if (name === "nth-child" || name === "nth-last-child") {
            const ofIndex = findSelectorKeyword(balanced.content, "of");
            if (ofIndex >= 0) {
              const argumentSpecificity = maxSelectorSpecificity(
                splitSelectorList(balanced.content.slice(ofIndex + 2))
              );
              addSpecificity(counts, argumentSpecificity);
            }
          }
          i = balanced.end;
        }
      }
      compoundStart = false;
      continue;
    }
    if (char === "|" && selector[i + 1] !== "|") {
      compoundStart = true;
      i += 1;
      continue;
    }
    const end = readSelectorName(selector, i);
    if (end > i) {
      if (compoundStart) {
        counts.elements += 1;
      }
      i = end;
      compoundStart = false;
      continue;
    }
    compoundStart = false;
    i += 1;
  }
  return counts;
}

export type AttributeHandler = {
  id: string;
  match: (name: string) => boolean;
  handle: (element: Element, name: string, value: string, scope: Scope) => boolean | void;
};

export type HtmlTransformContext = {
  element: HTMLElement;
  trusted: boolean;
};

export type HtmlTransformer = (value: unknown, context: HtmlTransformContext) => unknown;

export type HtmlTransformOptions = {
  priority?: number;
};

export type HtmlSetOptions = {
  trusted?: boolean;
};

type RegisteredHtmlTransformer = {
  transform: HtmlTransformer;
  priority: number;
  order: number;
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
  onBlocks: { event: string; body: BlockNode; flags: DeclarationFlags; flagArgs: DeclarationFlagArgs; args: string[] }[];
  declarations: DeclarationNode[];
  functions: FunctionBinding[];
};

type BehaviorListener = {
  target: EventTarget;
  event: string;
  handler: (event?: Event) => void;
  options?: AddEventListenerOptions | undefined;
};

type ScopeWatcher = {
  scope: Scope;
  kind: "path" | "any";
  key?: string;
  handler: () => void;
  behaviorId?: number;
};

export type FlagApplyContext = {
  name: string;
  args: any;
  element: Element;
  scope: Scope;
  declaration: DeclarationNode;
};

export type FlagHandler = {
  onApply?: (context: FlagApplyContext) => void;
  transformValue?: (context: FlagApplyContext, value: any) => any;
  onEventBind?: (context: EventFlagContext) => EventBindPatch | void;
  onEventBefore?: (context: EventFlagContext) => boolean | void;
  onEventAfter?: (context: EventFlagContext) => void;
  transformEventArgs?: (context: EventFlagContext, args: any[]) => any[];
};

export type BehaviorModifierHandler = {
  onBind?: (context: BehaviorModifierContext) => void | Promise<void>;
  onConstruct?: (context: BehaviorModifierContext) => void | Promise<void>;
  onDestruct?: (context: BehaviorModifierContext) => void | Promise<void>;
  onUnbind?: (context: BehaviorModifierContext) => void | Promise<void>;
};

export type BehaviorModifierContext = {
  name: string;
  args: any;
  element: Element;
  scope: Scope;
  rootScope: Scope | undefined;
  behavior: RegisteredBehavior;
  engine: Engine;
};

export type EventBindPatch = {
  listenerTarget?: EventTarget;
  options?: AddEventListenerOptions;
  debounceMs?: number;
};

export type EventFlagContext = {
  name: string;
  args: any;
  element: Element;
  scope: Scope;
  rootScope: Scope | undefined;
  event: Event | undefined;
  engine: Engine;
};

export type EngineOptions = {
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
  private behaviorRegistryHashes = new Set<string>();
  private behaviorEntriesById = new Map<number, RegisteredBehavior>();
  private dynamicBehaviorIds = new WeakMap<Element, Set<number>>();
  private behaviorBoundElements = new Map<number, Set<Element>>();
  private behaviorBindings = new WeakMap<Element, Set<number>>();
  private behaviorRootScopes = new WeakMap<Element, Map<number, Scope>>();
  private behaviorListeners = new WeakMap<Element, Map<number, BehaviorListener[]>>();
  private inlineListeners = new WeakMap<Element, BehaviorListener[]>();
  private behaviorId = 0;
  private codeCache = new Map<string, BlockNode>();
  private behaviorCache = new Map<string, CachedBehavior>();
  private observer: MutationObserver | undefined;
  private attributeHandlers: AttributeHandler[] = [];
  private htmlTransformers: RegisteredHtmlTransformer[] = [];
  private htmlTransformerOrder = 0;
  private globals: Record<string, any> = {};
  private importantFlags = new WeakMap<Element, Set<string>>();
  private inlineDeclarations = new WeakMap<Element, Set<string>>();
  private flagHandlers = new Map<string, FlagHandler>();
  private behaviorModifiers = new Map<string, BehaviorModifierHandler>();
  private pendingAdded = new Set<Element>();
  private pendingRemoved = new Set<Element>();
  private pendingUpdated = new Set<Element>();
  private observerFlush?: () => void;
  private ignoredAdded = new WeakMap<Element, boolean>();
  private diagnostics: boolean;
  private logger: Partial<Pick<Console, "info" | "warn">>;
  private pendingUses: Promise<void>[] = [];
  private pendingAutoBindToScope: Array<{ element: Element; expr: string; scope: Scope }> = [];
  private scopeWatchers = new WeakMap<Element, ScopeWatcher[]>();
  private executionStack: Element[] = [];
  private groupProxyCache = new WeakMap<Scope, Record<string, any>>();
  private scopeElements = new WeakMap<Scope, Element>();
  private classMapBindings = new WeakMap<Element, Map<object, Set<string>>>();
  private behaviorClassMapBindings = new WeakMap<Element, Map<number, Set<object>>>();
  private behaviorInvalidators = new WeakMap<Element, Map<number, Set<() => void>>>();
  private mountedRoots = new Set<HTMLElement>();
  private inactiveSubtrees = new WeakSet<Element>();

  constructor(options: EngineOptions = {}) {
    this.diagnostics = options.diagnostics ?? false;
    this.logger = options.logger ?? console;
    this.registerGlobal("console", console);
    this.registerFlag("important");
    this.registerFlag("debounce", {
      onEventBind: ({ args }) => ({
        debounceMs: typeof args === "number" ? args : 200
      })
    });
    this.registerFlag("prevent", {
      onEventBefore: ({ event }) => {
        event?.preventDefault();
      }
    });
    this.registerFlag("stop", {
      onEventBefore: ({ event }) => {
        event?.stopPropagation();
      }
    });
    this.registerFlag("self", {
      onEventBefore: ({ event, element }) => {
        const target = event?.target;
        if (!(target instanceof Node)) {
          return false;
        }
        return target === element;
      }
    });
    this.registerFlag("outside", {
      onEventBind: ({ element }) => ({ listenerTarget: element.ownerDocument }),
      onEventBefore: ({ event, element }) => {
        const target = event?.target;
        if (!(target instanceof Node)) {
          return false;
        }
        return !element.contains(target);
      }
    });
    this.registerFlag("once", {
      onEventBind: () => ({ options: { once: true } })
    });
    this.registerFlag("passive", {
      onEventBind: () => ({ options: { passive: true } })
    });
    this.registerFlag("capture", {
      onEventBind: () => ({ options: { capture: true } })
    });
    this.registerFlag("shift", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "shift")
    });
    this.registerFlag("ctrl", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "ctrl")
    });
    this.registerFlag("control", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "ctrl")
    });
    this.registerFlag("alt", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "alt")
    });
    this.registerFlag("meta", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "meta")
    });
    this.registerFlag("enter", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "enter")
    });
    this.registerFlag("escape", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "escape")
    });
    this.registerFlag("esc", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "escape")
    });
    this.registerFlag("tab", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "tab")
    });
    this.registerFlag("space", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "space")
    });
    this.registerFlag("up", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowup")
    });
    this.registerFlag("down", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowdown")
    });
    this.registerFlag("left", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowleft")
    });
    this.registerFlag("right", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowright")
    });
    this.registerFlag("arrowup", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowup")
    });
    this.registerFlag("arrowdown", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowdown")
    });
    this.registerFlag("arrowleft", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowleft")
    });
    this.registerFlag("arrowright", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "arrowright")
    });
    this.registerFlag("delete", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "delete")
    });
    this.registerFlag("backspace", {
      onEventBefore: ({ event }) => this.matchesKeyFlag(event, "backspace")
    });
    this.registerFlag("minwidth", {
      onEventBefore: ({ args }) => this.matchesMinWidth(args)
    });
    this.registerFlag("maxwidth", {
      onEventBefore: ({ args }) => this.matchesMaxWidth(args)
    });
    this.registerGlobal("minwidth", (value: any) => this.matchesMinWidth(value));
    this.registerGlobal("maxwidth", (value: any) => this.matchesMaxWidth(value));
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
    this.registerFlag("int", {
      transformValue: (_context, value) => this.coerceInt(value)
    });
    this.registerFlag("float", {
      transformValue: (_context, value) => this.coerceFloat(value)
    });
    this.registerBehaviorModifier("group", {
      onConstruct: ({ args, scope, rootScope, behavior, element }) => {
        const key = typeof args === "string" ? args : undefined;
        if (!key) {
          return;
        }
        const targetScope = this.getGroupTargetScope(element, behavior, scope, rootScope);
        const existing = targetScope.getPath?.(key);
        const list = Array.isArray(existing) ? existing : [];
        const proxy = this.getGroupProxy(scope);
        if (!list.includes(proxy)) {
          list.push(proxy);
          targetScope.setPath?.(key, list);
        } else if (!Array.isArray(existing)) {
          targetScope.setPath?.(key, list);
        }
      },
      onUnbind: ({ args, scope, rootScope, behavior, element }) => {
        const key = typeof args === "string" ? args : undefined;
        if (!key) {
          return;
        }
        const targetScope = this.getGroupTargetScope(element, behavior, scope, rootScope);
        const existing = targetScope.getPath?.(key);
        if (!Array.isArray(existing)) {
          return;
        }
        const proxy = this.getGroupProxy(scope);
        const next = existing.filter((entry) => entry !== proxy);
        if (next.length !== existing.length) {
          targetScope.setPath?.(key, next);
        }
      }
    });
  }

  private matchesMinWidth(value: any): boolean {
    const px = this.parseWidthArg(value);
    if (px === undefined) {
      return false;
    }
    return this.mediaMatches(`(min-width: ${px}px)`);
  }

  private matchesMaxWidth(value: any): boolean {
    const px = this.parseWidthArg(value);
    if (px === undefined) {
      return false;
    }
    return this.mediaMatches(`(max-width: ${px}px)`);
  }

  private parseWidthArg(value: any): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const match = value.match(/-?\d+(\.\d+)?/);
      if (!match) {
        return undefined;
      }
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private mediaMatches(query: string): boolean {
    const matcher = (globalThis as any).matchMedia;
    if (typeof matcher !== "function") {
      return false;
    }
    return Boolean(matcher(query)?.matches);
  }

  private getGroupTargetScope(
    element: Element,
    behavior: RegisteredBehavior,
    scope: Scope,
    rootScope?: Scope
  ): Scope {
    let targetScope = rootScope ?? scope;
    if (behavior.parentSelector) {
      const parentElement = element.closest(behavior.parentSelector);
      if (parentElement) {
        targetScope = this.getScope(parentElement);
      }
    }
    return targetScope;
  }

  private getGroupProxy(scope: Scope): Record<string, any> {
    const cached = this.groupProxyCache.get(scope);
    if (cached) {
      return cached;
    }
    const element = this.scopeElements.get(scope);
    const proxy = new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop === "symbol") {
            return undefined;
          }
          if (prop === "__element") {
            return element;
          }
          if (prop === "__scope") {
            return scope;
          }
          const key = String(prop);
          const value = scope.getPath(key);
          const rootKey = key.split(".")[0];
          const hasKey = rootKey ? scope.hasKey?.(rootKey) : false;
          if (value !== undefined || hasKey) {
            return value;
          }
          if (element && key in element) {
            const elementValue = (element as any)[key];
            if (typeof elementValue === "function") {
              return elementValue.bind(element);
            }
            return elementValue;
          }
          return undefined;
        },
        set: (_target, prop, value) => {
          if (typeof prop === "symbol") {
            return false;
          }
          scope.setPath(String(prop), value);
          return true;
        },
        has: (_target, prop) => {
          if (typeof prop === "symbol") {
            return false;
          }
          return scope.getPath(String(prop)) !== undefined;
        },
        getOwnPropertyDescriptor: () => ({
          enumerable: true,
          configurable: true
        }),
        ownKeys: () => []
      }
    );
    this.groupProxyCache.set(scope, proxy);
    return proxy;
  }

  async mount(root: HTMLElement): Promise<void> {
    const documentRoot = root.ownerDocument;
    const active = Engine.activeEngines.get(documentRoot);
    if (active && active !== this) {
      active.disposeMountedRoots();
    }
    Engine.activeEngines.set(documentRoot, this);
    const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      this.inactiveSubtrees.delete(element);
    }
    for (const element of elements) {
      if (element === root && root === root.ownerDocument.body && !this.hasVsnAttributes(element)) {
        continue;
      }
      this.getScope(element, this.findParentScope(element));
    }
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
    const isMountedRoot = element instanceof HTMLElement && this.mountedRoots.delete(element);
    this.inactiveSubtrees.add(element);
    if (isMountedRoot) {
      this.reconnectObserver();
    }
    const elements = [element, ...Array.from(element.querySelectorAll("*"))];
    for (const current of elements) {
      this.teardownElement(current);
    }
  }

  registerBehaviors(source: string): void {
    this.registerBehaviorSource(source);
  }

  private registerBehaviorSource(source: string, dynamicOwner?: Element): void {
    const program = new Parser(source, {
      customFlags: new Set(this.flagHandlers.keys()),
      behaviorFlags: new Set(this.behaviorModifiers.keys())
    }).parseProgram();
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
      this.collectBehavior(behavior, undefined, undefined, dynamicOwner);
    }
  }

  registerGlobal(name: string, value: any): void {
    this.globals[name] = value;
  }

  registerGlobals(values: Record<string, any>): void {
    Object.assign(this.globals, values);
  }

  registerFlag(name: string, handler: FlagHandler = {}): void {
    this.flagHandlers.set(name, handler);
  }

  registerBehaviorModifier(name: string, handler: BehaviorModifierHandler = {}): void {
    const reserved = new Set(["important", "debounce"]);
    if (reserved.has(name)) {
      throw new Error(`Behavior modifier '${name}' is reserved`);
    }
    this.behaviorModifiers.set(name, handler);
  }

  registerHtmlTransformer(
    transform: HtmlTransformer,
    options: HtmlTransformOptions = {}
  ): () => void {
    const entry: RegisteredHtmlTransformer = {
      transform,
      priority: options.priority ?? 0,
      order: this.htmlTransformerOrder += 1
    };
    this.htmlTransformers.push(entry);
    this.htmlTransformers.sort((a, b) => a.priority - b.priority || a.order - b.order);
    return () => {
      const index = this.htmlTransformers.indexOf(entry);
      if (index >= 0) {
        this.htmlTransformers.splice(index, 1);
      }
    };
  }

  getRegistryStats(): { behaviorCount: number; behaviorCacheSize: number } {
    return {
      behaviorCount: this.behaviorRegistry.length,
      behaviorCacheSize: this.behaviorCache.size
    };
  }

  registerAttributeHandler(handler: AttributeHandler): void {
    const existingIndex = this.attributeHandlers.findIndex((existing) => existing.id === handler.id);
    if (existingIndex >= 0) {
      this.attributeHandlers.splice(existingIndex, 1);
    }
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
    const configuredDelayMs = config.intervalMs ?? 100;
    const initialDelayMs = Number.isFinite(configuredDelayMs) && configuredDelayMs > 0
      ? configuredDelayMs
      : 1;
    const maxDelayMs = 1000;
    const existing = this.resolveGlobalPath(use.name);
    if (existing !== undefined) {
      this.registerGlobal(use.alias, existing);
      return Promise.resolve();
    }
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
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
      if (parentScope) {
        existing.setParent(parentScope);
      }
      if (!this.scopeElements.has(existing)) {
        this.scopeElements.set(existing, element);
      }
      return existing;
    }
    const scope = new Scope(parentScope ?? this.findParentScope(element));
    this.scopes.set(element, scope);
    this.scopeElements.set(scope, element);
    return scope;
  }

  setHtml(element: Element, value: unknown, options: HtmlSetOptions = {}): void {
    if (!(element instanceof HTMLElement)) {
      return;
    }
    const context: HtmlTransformContext = {
      element,
      trusted: options.trusted ?? false
    };
    let transformed = value;
    for (const entry of this.htmlTransformers) {
      transformed = entry.transform(transformed, context);
    }
    element.innerHTML = transformed == null ? "" : String(transformed);
    this.processHtml(element);
  }

  processHtml(root: Element): void {
    this.handleHtmlBehaviors(root);
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
      this.setHtml(element, scope.get(htmlBinding.expr.trim()), { trusted: htmlBinding.trusted });
    }
  }

  private attachObserver(root: HTMLElement): void {
    if (!this.observer) {
      this.observerFlush = debounce(() => this.flushObserverQueue(), 10);
      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes" && mutation.target instanceof Element) {
            if (!this.isInactive(mutation.target)) {
              this.pendingUpdated.add(mutation.target);
            }
          }
          for (const node of Array.from(mutation.addedNodes)) {
            if (node && node.nodeType === 1) {
              const element = node as Element;
              if (this.ignoredAdded.has(element)) {
                this.ignoredAdded.delete(element);
                continue;
              }
              if (!this.isInactive(element)) {
                this.pendingAdded.add(element);
              }
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
    }
    this.mountedRoots.add(root);
    this.observeRoot(root);
  }

  private observeRoot(root: HTMLElement): void {
    this.observer?.observe(root, { childList: true, subtree: true, attributes: true });
  }

  private reconnectObserver(): void {
    if (!this.observer) {
      return;
    }
    this.observer.disconnect();
    if (this.mountedRoots.size === 0) {
      this.disconnectObserver();
      return;
    }
    for (const root of this.mountedRoots) {
      this.observeRoot(root);
    }
  }

  private disposeMountedRoots(): void {
    const roots = Array.from(this.mountedRoots);
    this.disconnectObserver();
    this.mountedRoots.clear();
    for (const root of roots) {
      for (const element of [root, ...Array.from(root.querySelectorAll("*"))]) {
        this.teardownElement(element);
      }
    }
  }

  private disconnectObserver(): void {
    this.observer?.disconnect();
    this.observer = undefined;
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
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      this.teardownElement(element);
    }
  }

  private teardownElement(element: Element): void {
    if (this.lifecycleBindings.has(element)) {
      this.runDestruct(element);
    }
    if (this.behaviorBindings.has(element)) {
      this.runBehaviorDestruct(element);
    }
    this.cleanupBehaviorResources(element);
    this.cleanupBehaviorListeners(element);
    this.cleanupInlineListeners(element);
    this.disposeDynamicBehaviors(element);
  }

  private handleAddedNode(node: Element, applyBehaviors = true): void {
    if (this.isInactive(node)) {
      return;
    }
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      this.getScope(element, this.findParentScope(element));
    }
    for (const element of elements) {
      if (!this.hasVsnAttributes(element)) {
        continue;
      }
      const parentScope = this.findParentScope(element);
      this.getScope(element, parentScope);
      this.attachAttributes(element);
      this.runConstruct(element);
    }
    if (applyBehaviors) {
      void this.applyBehaviors(node);
    }
  }

  private handleUpdatedNode(node: Element): void {
    if (this.isInactive(node)) {
      return;
    }
    const elements = [node, ...Array.from(node.querySelectorAll("*"))];
    for (const element of elements) {
      void this.reapplyBehaviorsForElement(element);
    }
  }

  private async applyBehaviors(root: Element): Promise<void> {
    if (this.isInactive(root)) {
      return;
    }
    await this.waitForUses();
    if (this.behaviorRegistry.length > 0) {
      const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
      for (const element of elements) {
        await this.reapplyBehaviorsForElement(element);
      }
    }
    this.flushAutoBindQueue();
  }

  private isInactive(element: Element): boolean {
    let current: Element | null = element;
    while (current) {
      if (this.inactiveSubtrees.has(current)) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  private async reapplyBehaviorsForElement(element: Element): Promise<void> {
    if (this.behaviorRegistry.length === 0) {
      return;
    }
    const bound = this.behaviorBindings.get(element) ?? new Set<number>();
    this.behaviorBindings.set(element, bound);
    const scope = this.getScope(element, this.findParentScope(element));
    const matched = this.behaviorRegistry
      .filter((behavior) => element.matches(behavior.selector))
      .map((behavior) => ({
        behavior,
        specificity: this.computeSpecificityForElement(behavior.selector, element)
      }))
      .sort((a, b) => {
        if (a.specificity !== b.specificity) {
          return a.specificity - b.specificity;
        }
        return a.behavior.order - b.behavior.order;
      });

    for (const { behavior } of matched) {
      if (!bound.has(behavior.id)) {
        await this.applyBehaviorForElement(behavior, element, scope, bound);
      }
    }

    const matchedIds = new Set(matched.map(({ behavior }) => behavior.id));
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
    const boundElements = this.behaviorBoundElements.get(behavior.id) ?? new Set<Element>();
    boundElements.add(element);
    this.behaviorBoundElements.set(behavior.id, boundElements);
    const rootScope = this.getBehaviorRootScope(element, behavior);
    const rootScopes = this.behaviorRootScopes.get(element) ?? new Map<number, Scope>();
    rootScopes.set(behavior.id, rootScope);
    this.behaviorRootScopes.set(element, rootScopes);
    this.applyBehaviorFunctions(element, scope, behavior.functions, rootScope);
    await this.applyBehaviorDeclarations(element, scope, behavior.declarations, rootScope, behavior.id);
    await this.applyBehaviorModifierHook("onBind", behavior, element, scope, rootScope);
    if (behavior.construct) {
      await this.safeExecuteBlock(behavior.construct, scope, element, rootScope);
    }
    await this.applyBehaviorModifierHook("onConstruct", behavior, element, scope, rootScope);
    for (const onBlock of behavior.onBlocks) {
      this.attachBehaviorOnHandler(
        element,
        onBlock.event,
        onBlock.body,
        onBlock.flags,
        onBlock.flagArgs,
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
    const boundElements = this.behaviorBoundElements.get(behavior.id);
    boundElements?.delete(element);
    if (boundElements?.size === 0) {
      this.behaviorBoundElements.delete(behavior.id);
    }
    this.cleanupBehaviorResources(element, behavior.id);
    const rootScope = this.getBehaviorRootScope(element, behavior);
    if (behavior.destruct) {
      void this.safeExecuteBlock(behavior.destruct, scope, element, rootScope);
    }
    this.behaviorRootScopes.get(element)?.delete(behavior.id);
    void this.applyBehaviorModifierHook("onDestruct", behavior, element, scope, rootScope);
    const listenerMap = this.behaviorListeners.get(element);
    const listeners = listenerMap?.get(behavior.id);
    if (listeners) {
      for (const listener of listeners) {
        listener.target.removeEventListener(listener.event, listener.handler, listener.options);
      }
      listenerMap?.delete(behavior.id);
    }
    void this.applyBehaviorModifierHook("onUnbind", behavior, element, scope, rootScope);
    this.logDiagnostic("unbind", element, behavior);
  }

  private runBehaviorDestruct(element: Element): void {
    const bound = this.behaviorBindings.get(element);
    if (!bound) {
      return;
    }
    const scope = this.getScope(element);
    for (const behavior of this.behaviorRegistry) {
      if (!bound.has(behavior.id) || (!behavior.destruct && !this.behaviorHasModifierHooks(behavior))) {
        continue;
      }
      const rootScope = this.getBehaviorRootScope(element, behavior);
      if (behavior.destruct) {
        void this.safeExecuteBlock(behavior.destruct, scope, element, rootScope);
      }
      void this.applyBehaviorModifierHook("onDestruct", behavior, element, scope, rootScope);
      void this.applyBehaviorModifierHook("onUnbind", behavior, element, scope, rootScope);
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

  private coerceInt(value: any): any {
    if (value == null || value === "") {
      return value;
    }
    const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
    return Number.isNaN(num) ? value : num;
  }

  private coerceFloat(value: any): any {
    if (value == null || value === "") {
      return value;
    }
    const num = typeof value === "number" ? value : Number.parseFloat(String(value));
    return Number.isNaN(num) ? value : num;
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

  private watch(scope: Scope, expr: string, handler: () => void, element?: Element, behaviorId?: number): void {
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
        this.trackScopeWatcher(element, target, "path", handler, key, behaviorId);
      }
      return;
    }
    let cursor: Scope | undefined = scope;
    while (cursor) {
      cursor.on(key, handler);
      if (element) {
        this.trackScopeWatcher(element, cursor, "path", handler, key, behaviorId);
      }
      cursor = cursor.parent;
    }
  }

  private watchWithDebounce(
    scope: Scope,
    expr: string,
    handler: () => void,
    debounceMs?: number,
    element?: Element,
    behaviorId?: number
  ): void {
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    this.watch(scope, expr, effectiveHandler, element, behaviorId);
  }

  private watchExpression(
    scope: Scope,
    rootScope: Scope | undefined,
    expression: ExpressionNode,
    handler: () => void,
    debounceMs?: number,
    element?: Element,
    behaviorId?: number
  ): void {
    const dependencies = this.getExpressionDependencies(expression);
    if (dependencies.length === 0) {
      return;
    }
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    for (const dependency of dependencies) {
      this.watchExpressionDependency(
        scope,
        rootScope,
        dependency,
        effectiveHandler,
        element,
        behaviorId
      );
    }
  }

  private getExpressionDependencies(expression: ExpressionNode): string[] {
    const dependencies = new Set<string>();
    const visit = (node: any): void => {
      if (!node || typeof node !== "object") {
        return;
      }
      if (node instanceof IdentifierExpression) {
        if (node.name !== "self") {
          dependencies.add(node.name);
        }
        return;
      }
      if (node.type === "MemberExpression") {
        const path = node.getIdentifierPath?.()?.path;
        if (path) {
          dependencies.add(path);
          return;
        }
        visit(node.target);
        return;
      }
      switch (node.type) {
        case "Assignment":
          visit(node.target);
          visit(node.value);
          return;
        case "ArrayExpression":
          for (const element of node.elements ?? []) {
            visit(element);
          }
          return;
        case "ObjectExpression":
          for (const entry of node.entries ?? []) {
            if (entry?.spread) {
              visit(entry.spread);
              continue;
            }
            if (entry?.computed) {
              visit(entry.keyExpr);
            }
            visit(entry?.value);
          }
          return;
        case "ElementDirective":
        case "ElementProperty":
          visit(node.element);
          return;
        case "TemplateExpression":
          for (const part of node.parts ?? []) {
            visit(part);
          }
          return;
        case "TaggedTemplateExpression":
          visit(node.tag);
          visit(node.template);
          return;
        case "UnaryExpression":
        case "AwaitExpression":
          visit(node.argument);
          return;
        case "BinaryExpression":
          visit(node.left);
          visit(node.right);
          return;
        case "TernaryExpression":
          visit(node.test);
          visit(node.consequent);
          visit(node.alternate);
          return;
        case "CallExpression":
          visit(node.callee);
          for (const arg of node.args ?? []) {
            visit(arg);
          }
          return;
        case "IndexExpression":
          visit(node.target);
          visit(node.index);
          return;
        default:
          return;
      }
    };
    visit(expression);
    return Array.from(dependencies);
  }

  private watchExpressionDependency(
    scope: Scope,
    rootScope: Scope | undefined,
    dependency: string,
    handler: () => void,
    element?: Element,
    behaviorId?: number
  ): void {
    const path = dependency.trim();
    if (!path) {
      return;
    }
    if (path.startsWith("root.")) {
      const target = rootScope ?? this.getRootScope(scope);
      this.watchDirectScope(target, path.slice("root.".length), handler, element, behaviorId);
      return;
    }
    if (path.startsWith("parent.")) {
      let target: Scope | undefined = scope;
      let targetPath = path;
      while (targetPath.startsWith("parent.")) {
        target = target?.parent;
        targetPath = targetPath.slice("parent.".length);
      }
      if (target) {
        this.watchDirectScope(target, targetPath, handler, element, behaviorId);
      }
      return;
    }
    if (path.startsWith("self.")) {
      this.watchDirectScope(scope, path.slice("self.".length), handler, element, behaviorId);
      return;
    }
    const root = path.split(".")[0];
    if (!root || (!this.hasScopeKey(scope, root) && root in this.globals)) {
      return;
    }
    this.watch(scope, path, handler, element, behaviorId);
  }

  private watchDirectScope(
    scope: Scope | undefined,
    path: string,
    handler: () => void,
    element?: Element,
    behaviorId?: number
  ): void {
    if (!scope || !path) {
      return;
    }
    scope.on(path, handler);
    if (element) {
      this.trackScopeWatcher(element, scope, "path", handler, path, behaviorId);
    }
  }

  private hasScopeKey(scope: Scope, key: string): boolean {
    let cursor: Scope | undefined = scope;
    while (cursor) {
      if (cursor.hasKey(key)) {
        return true;
      }
      cursor = cursor.parent;
    }
    return false;
  }

  private getRootScope(scope: Scope): Scope {
    let root = scope;
    while (root.parent) {
      root = root.parent;
    }
    return root;
  }

  private trackScopeWatcher(
    element: Element,
    scope: Scope,
    kind: "path" | "any",
    handler: () => void,
    key?: string,
    behaviorId?: number
  ): void {
    const watchers = this.scopeWatchers.get(element) ?? [];
    watchers.push({ scope, kind, handler, ...(key ? { key } : {}), ...(behaviorId !== undefined ? { behaviorId } : {}) });
    this.scopeWatchers.set(element, watchers);
  }

  private cleanupScopeWatchers(element: Element, behaviorId?: number): void {
    const watchers = this.scopeWatchers.get(element);
    if (!watchers) {
      return;
    }
    const remaining: ScopeWatcher[] = [];
    for (const watcher of watchers) {
      if (behaviorId !== undefined && watcher.behaviorId !== behaviorId) {
        remaining.push(watcher);
        continue;
      }
      if (watcher.kind === "any") {
        watcher.scope.offAny(watcher.handler);
        continue;
      }
      if (watcher.key) {
        watcher.scope.off(watcher.key, watcher.handler);
      }
    }
    if (remaining.length > 0) {
      this.scopeWatchers.set(element, remaining);
    } else {
      this.scopeWatchers.delete(element);
    }
  }

  private trackBehaviorClassMapBinding(element: Element, behaviorId: number, binding: object): void {
    const bindings = this.behaviorClassMapBindings.get(element) ?? new Map<number, Set<object>>();
    const behaviorBindings = bindings.get(behaviorId) ?? new Set<object>();
    behaviorBindings.add(binding);
    bindings.set(behaviorId, behaviorBindings);
    this.behaviorClassMapBindings.set(element, bindings);
  }

  private cleanupBehaviorClassMapBindings(element: Element, behaviorId: number): void {
    const bindings = this.behaviorClassMapBindings.get(element);
    const behaviorBindings = bindings?.get(behaviorId);
    if (!behaviorBindings) {
      return;
    }
    for (const binding of behaviorBindings) {
      this.clearClassMapBinding(element, binding);
    }
    bindings?.delete(behaviorId);
    if (bindings?.size === 0) {
      this.behaviorClassMapBindings.delete(element);
    }
  }

  private trackBehaviorInvalidator(element: Element, behaviorId: number, invalidator: () => void): void {
    const invalidators = this.behaviorInvalidators.get(element) ?? new Map<number, Set<() => void>>();
    const behaviorInvalidators = invalidators.get(behaviorId) ?? new Set<() => void>();
    behaviorInvalidators.add(invalidator);
    invalidators.set(behaviorId, behaviorInvalidators);
    this.behaviorInvalidators.set(element, invalidators);
  }

  private cleanupBehaviorInvalidators(element: Element, behaviorId?: number): void {
    const invalidators = this.behaviorInvalidators.get(element);
    if (!invalidators) {
      return;
    }
    const ids = behaviorId === undefined ? Array.from(invalidators.keys()) : [behaviorId];
    for (const id of ids) {
      for (const invalidate of invalidators.get(id) ?? []) {
        invalidate();
      }
      invalidators.delete(id);
    }
    if (invalidators.size === 0) {
      this.behaviorInvalidators.delete(element);
    }
  }

  private cleanupBehaviorResources(element: Element, behaviorId?: number): void {
    this.cleanupScopeWatchers(element, behaviorId);
    this.cleanupBehaviorInvalidators(element, behaviorId);
    if (behaviorId !== undefined) {
      this.cleanupBehaviorClassMapBindings(element, behaviorId);
      return;
    }
    const bindings = this.behaviorClassMapBindings.get(element);
    if (!bindings) {
      return;
    }
    for (const id of Array.from(bindings.keys())) {
      this.cleanupBehaviorClassMapBindings(element, id);
    }
  }

  private cleanupBehaviorListeners(element: Element): void {
    const listenerMap = this.behaviorListeners.get(element);
    if (listenerMap) {
      for (const listeners of listenerMap.values()) {
        for (const listener of listeners) {
          listener.target.removeEventListener(listener.event, listener.handler, listener.options);
        }
      }
      listenerMap.clear();
      this.behaviorListeners.delete(element);
    }
    const bound = this.behaviorBindings.get(element);
    if (bound) {
      for (const behaviorId of bound) {
        const boundElements = this.behaviorBoundElements.get(behaviorId);
        boundElements?.delete(element);
        if (boundElements?.size === 0) {
          this.behaviorBoundElements.delete(behaviorId);
        }
      }
    }
    this.behaviorBindings.delete(element);
    this.behaviorRootScopes.delete(element);
  }

  private cleanupInlineListeners(element: Element): void {
    const listeners = this.inlineListeners.get(element);
    if (!listeners) {
      return;
    }
    for (const listener of listeners) {
      listener.target.removeEventListener(listener.event, listener.handler, listener.options);
    }
    this.inlineListeners.delete(element);
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
    if (event.includes(".")) {
      throw new Error("vsn:on does not support dot modifiers; use !flags instead");
    }

    const { flagMap, flagArgs } = this.parseInlineFlags(flags);

    const config: OnConfig = {
      event,
      code: value,
      flags: flagMap,
      flagArgs
    };
    return config;
  }

  private parseInlineFlags(parts: string[]): { flagMap: DeclarationFlags; flagArgs: DeclarationFlagArgs } {
    const flagMap: DeclarationFlags = {};
    const flagArgs: DeclarationFlagArgs = {};
    for (const raw of parts) {
      const trimmed = raw.trim();
      if (!trimmed) {
        continue;
      }
      const match = trimmed.match(/^([a-zA-Z][\w-]*)(?:\((.+)\))?$/);
      if (!match) {
        continue;
      }
      const name = match[1] ?? "";
      if (!name) {
        continue;
      }
      if (!this.flagHandlers.has(name)) {
        throw new Error(`Unknown flag ${name}`);
      }
      flagMap[name] = true;
      if (match[2] !== undefined) {
        flagArgs[name] = this.parseInlineFlagArg(match[2]);
      }
    }
    return { flagMap, flagArgs };
  }

  private parseInlineFlagArg(raw: string): any {
    const trimmed = raw.trim();
    if (trimmed === "true") {
      return true;
    }
    if (trimmed === "false") {
      return false;
    }
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }
    return trimmed;
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
    const { listenerTarget, options, debounceMs } = this.getEventBindingConfig(
      element,
      config.flags,
      config.flagArgs
    );
    let effectiveHandler: (event?: Event) => void;
    const handler = async (event?: Event) => {
      if (!element.isConnected) {
        listenerTarget.removeEventListener(config.event, effectiveHandler, options);
        return;
      }
      const scope = this.getScope(element);
      if (!this.applyEventFlagBefore(element, scope, config.flags, config.flagArgs, event)) {
        return;
      }
      try {
        await this.execute(config.code, scope, element);
        this.evaluate(element);
      } catch (error) {
        this.emitError(element, error);
      } finally {
        this.applyEventFlagAfter(element, scope, config.flags, config.flagArgs, event);
      }
    };
    effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    listenerTarget.addEventListener(config.event, effectiveHandler, options);
    const listeners = this.inlineListeners.get(element) ?? [];
    listeners.push({ target: listenerTarget, event: config.event, handler: effectiveHandler, options });
    this.inlineListeners.set(element, listeners);
  }

  private attachBehaviorOnHandler(
    element: Element,
    event: string,
    body: BlockNode,
    flags: DeclarationFlags,
    flagArgs: DeclarationFlagArgs,
    args: string[] | undefined,
    behaviorId: number,
    rootScope?: Scope
  ): void {
    if (event.includes(".")) {
      throw new Error("vsn:on does not support dot modifiers; use !flags instead");
    }
    const { listenerTarget, options, debounceMs } = this.getEventBindingConfig(element, flags, flagArgs);
    const handler = async (evt?: Event) => {
      const scope = this.getScope(element);
      if (!this.applyEventFlagBefore(element, scope, flags, flagArgs, evt)) {
        return;
      }
      const previousValues = new Map<string, any>();
      if (args && args.length > 0) {
        const argName = args[0];
        if (argName) {
          previousValues.set(argName, scope.getPath(argName));
          const [nextArg] = this.applyEventFlagArgTransforms(element, scope, flags, flagArgs, evt);
          scope.setPath(argName, nextArg);
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
        this.applyEventFlagAfter(element, scope, flags, flagArgs, evt);
      }
      if (!failed) {
        this.evaluate(element);
      }
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    listenerTarget.addEventListener(event, effectiveHandler, options);
    const listenerMap = this.behaviorListeners.get(element) ?? new Map<number, BehaviorListener[]>();
    const listeners = listenerMap.get(behaviorId) ?? [];
    listeners.push({ target: listenerTarget, event, handler: effectiveHandler, options });
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
          this.handleHtmlBehaviors(target);
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

  private getEventBindingConfig(
    element: Element,
    flags: DeclarationFlags,
    flagArgs: DeclarationFlagArgs
  ): { listenerTarget: EventTarget; options?: AddEventListenerOptions; debounceMs?: number } {
    let listenerTarget: EventTarget = element;
    let options: AddEventListenerOptions = {};
    let debounceMs: number | undefined;
    for (const name of Object.keys(flags)) {
      const handler = this.flagHandlers.get(name);
      if (!handler?.onEventBind) {
        continue;
      }
      const patch = handler.onEventBind({
        name,
        args: flagArgs[name],
        element,
        scope: this.getScope(element),
        rootScope: undefined,
        event: undefined,
        engine: this
      });
      if (!patch) {
        continue;
      }
      if (patch.listenerTarget) {
        listenerTarget = patch.listenerTarget;
      }
      if (patch.options) {
        options = { ...options, ...patch.options };
      }
      if (patch.debounceMs !== undefined) {
        debounceMs = patch.debounceMs;
      }
    }
    return {
      listenerTarget,
      ...(Object.keys(options).length > 0 ? { options } : {}),
      ...(debounceMs !== undefined ? { debounceMs } : {})
    };
  }

  private applyEventFlagBefore(
    element: Element,
    scope: Scope,
    flags: DeclarationFlags,
    flagArgs: DeclarationFlagArgs,
    event?: Event
  ): boolean {
    for (const name of Object.keys(flags)) {
      const handler = this.flagHandlers.get(name);
      if (!handler?.onEventBefore) {
        continue;
      }
      const result = handler.onEventBefore({
        name,
        args: flagArgs[name],
        element,
        scope,
        rootScope: undefined,
        event,
        engine: this
      });
      if (result === false) {
        return false;
      }
    }
    return true;
  }

  private applyEventFlagAfter(
    element: Element,
    scope: Scope,
    flags: DeclarationFlags,
    flagArgs: DeclarationFlagArgs,
    event?: Event
  ): void {
    for (const name of Object.keys(flags)) {
      const handler = this.flagHandlers.get(name);
      if (!handler?.onEventAfter) {
        continue;
      }
      handler.onEventAfter({
        name,
        args: flagArgs[name],
        element,
        scope,
        rootScope: undefined,
        event,
        engine: this
      });
    }
  }

  private applyEventFlagArgTransforms(
    element: Element,
    scope: Scope,
    flags: DeclarationFlags,
    flagArgs: DeclarationFlagArgs,
    event?: Event
  ): any[] {
    let args: any[] = [event];
    for (const name of Object.keys(flags)) {
      const handler = this.flagHandlers.get(name);
      if (!handler?.transformEventArgs) {
        continue;
      }
      const nextArgs = handler.transformEventArgs(
        {
          name,
          args: flagArgs[name],
          element,
          scope,
          rootScope: undefined,
          event,
          engine: this
        },
        args
      );
      if (Array.isArray(nextArgs)) {
        args = nextArgs;
      }
    }
    return args;
  }

  private matchesKeyFlag(event: Event | undefined, flag: string): boolean {
    if (!(event instanceof KeyboardEvent)) {
      return false;
    }
    const modifierChecks: Record<string, boolean> = {
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      meta: event.metaKey
    };
    if (flag in modifierChecks) {
      return modifierChecks[flag] ?? false;
    }
    const keyAliases: Record<string, string> = {
      escape: "escape",
      esc: "escape",
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
    const expectedKey = keyAliases[flag] ?? flag;
    return key === expectedKey;
  }

  private async withExecutionElement(element: Element | undefined, fn: () => Promise<void>): Promise<void> {
    if (!element) {
      await fn();
      return;
    }
    this.executionStack.push(element);
    try {
      await fn();
    } finally {
      this.executionStack.pop();
    }
  }

  getCurrentElement(): Element | undefined {
    return this.executionStack[this.executionStack.length - 1];
  }

  private async execute(code: string, scope: Scope, element?: Element, rootScope?: Scope): Promise<void> {
    let block = this.codeCache.get(code);
    if (!block) {
      block = Parser.parseInline(code);
      this.codeCache.set(code, block);
    }
    await this.withExecutionElement(element, async () => {
      const selfRef = this.getGroupProxy(scope);
      const context: ExecutionContext = {
        scope,
        rootScope,
        globals: this.globals,
        engine: this,
        ...(element ? { element } : {}),
        self: selfRef
      };
      await block.evaluate(context);
    });
  }

  private async executeBlock(block: BlockNode, scope: Scope, element?: Element, rootScope?: Scope): Promise<void> {
    await this.withExecutionElement(element, async () => {
      const selfRef = this.getGroupProxy(scope);
      const context: ExecutionContext = {
        scope,
        rootScope,
        globals: this.globals,
        engine: this,
        ...(element ? { element } : {}),
        self: selfRef
      };
      await block.evaluate(context);
    });
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

  private collectBehavior(
    behavior: BehaviorNode,
    parentSelector?: string,
    rootSelectorOverride?: string,
    dynamicOwner?: Element
  ): void {
    const nestedSelector = behavior.selector.selectorText;
    if (!parentSelector && hasNestingSelector(nestedSelector)) {
      throw new Error("Nesting selector '&' requires a parent behavior");
    }
    const selector = parentSelector
      ? composeNestedSelector(parentSelector, nestedSelector)
      : nestedSelector;
    const rootSelector = rootSelectorOverride ?? (parentSelector ?? behavior.selector.selectorText);
    const behaviorHash = this.hashBehavior(behavior);
    const hash = `${selector}::${rootSelector}::${behaviorHash}`;
    if (this.behaviorRegistryHashes.has(hash)) {
      const existing = this.behaviorRegistry.find((entry) => entry.hash === hash);
      if (existing && dynamicOwner) {
        existing.dynamicOwners.add(dynamicOwner);
        this.trackDynamicBehavior(dynamicOwner, existing.id);
      } else if (existing) {
        existing.persistent = true;
      }
      return;
    }
    const cached = this.getCachedBehavior(behavior);
    const entry: RegisteredBehavior = {
      id: this.behaviorId += 1,
      hash,
      selector,
      rootSelector,
      specificity: this.computeSpecificity(selector),
      order: this.behaviorRegistry.length,
      flags: behavior.flags ?? {},
      flagArgs: behavior.flagArgs ?? {},
      ...cached,
      ...(parentSelector ? { parentSelector } : {}),
      persistent: dynamicOwner === undefined,
      dynamicOwners: dynamicOwner ? new Set([dynamicOwner]) : new Set<Element>()
    };
    this.behaviorRegistry.push(entry);
    this.behaviorRegistryHashes.add(hash);
    this.behaviorEntriesById.set(entry.id, entry);
    if (dynamicOwner) {
      this.trackDynamicBehavior(dynamicOwner, entry.id);
    }
    this.collectNestedBehaviors(behavior.body, selector, rootSelector, dynamicOwner);
  }

  private collectNestedBehaviors(
    block: BlockNode,
    parentSelector: string,
    rootSelector: string,
    dynamicOwner?: Element
  ): void {
    for (const statement of block.statements) {
      if (statement instanceof BehaviorNode) {
        this.collectBehavior(statement, parentSelector, rootSelector, dynamicOwner);
        continue;
      }
      if (statement instanceof OnBlockNode) {
        this.collectNestedBehaviors(statement.body, parentSelector, rootSelector, dynamicOwner);
        continue;
      }
      if (statement instanceof BlockNode) {
        this.collectNestedBehaviors(statement, parentSelector, rootSelector, dynamicOwner);
      }
    }
  }

  private trackDynamicBehavior(owner: Element, behaviorId: number): void {
    const ids = this.dynamicBehaviorIds.get(owner) ?? new Set<number>();
    ids.add(behaviorId);
    this.dynamicBehaviorIds.set(owner, ids);
  }

  private disposeDynamicBehaviors(owner: Element): void {
    const ids = this.dynamicBehaviorIds.get(owner);
    if (!ids) {
      return;
    }

    for (const behaviorId of ids) {
      const behavior = this.behaviorEntriesById.get(behaviorId);
      if (!behavior) {
        continue;
      }
      behavior.dynamicOwners.delete(owner);
      if (behavior.persistent || behavior.dynamicOwners.size > 0) {
        continue;
      }

      for (const element of Array.from(this.behaviorBoundElements.get(behaviorId) ?? [])) {
        const bound = this.behaviorBindings.get(element);
        if (bound?.has(behaviorId)) {
          this.unbindBehaviorForElement(behavior, element, this.getScope(element), bound);
        }
      }
      this.behaviorRegistry = this.behaviorRegistry.filter((entry) => entry.id !== behaviorId);
      this.behaviorRegistryHashes.delete(behavior.hash);
      this.behaviorEntriesById.delete(behaviorId);
      this.behaviorBoundElements.delete(behaviorId);
    }

    this.dynamicBehaviorIds.delete(owner);
  }

  private computeSpecificity(selector: string): number {
    return specificityScore(maxSelectorSpecificity(splitSelectorList(selector)));
  }

  private computeSpecificityForElement(selector: string, element: Element): number {
    const groups = splitSelectorList(selector);
    const matchingGroups = groups.filter((group) => element.matches(group));
    return specificityScore(maxSelectorSpecificity(matchingGroups.length > 0 ? matchingGroups : groups));
  }

  private getBehaviorRootScope(element: Element, behavior: RegisteredBehavior): Scope {
    const stored = this.behaviorRootScopes.get(element)?.get(behavior.id);
    if (stored) {
      return stored;
    }
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

  private extractOnBlocks(
    body: BlockNode
  ): { event: string; body: BlockNode; flags: DeclarationFlags; flagArgs: DeclarationFlagArgs; args: string[] }[] {
    const blocks: { event: string; body: BlockNode; flags: DeclarationFlags; flagArgs: DeclarationFlagArgs; args: string[] }[] = [];
    for (const statement of body.statements) {
      if (statement instanceof OnBlockNode) {
        blocks.push({
          event: statement.eventName,
          body: statement.body,
          flags: statement.flags,
          flagArgs: statement.flagArgs,
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
        functions.push({
          name: statement.name,
          params: statement.params,
          body: statement.body,
          isAsync: statement.isAsync
        });
        continue;
      }
      if (statement instanceof AssignmentNode) {
        if (statement.target instanceof IdentifierExpression && statement.value instanceof FunctionExpression) {
          functions.push({
            name: statement.target.name,
            params: statement.value.params,
            body: statement.value.body,
            isAsync: statement.value.isAsync
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
        flags: node.flags ?? {},
        flagArgs: node.flagArgs ?? {},
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
        flags: node.flags ?? {},
        flagArgs: node.flagArgs ?? {},
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
        value: this.normalizeNode(node.value),
        operator: node.operator ?? "",
        prefix: Boolean(node.prefix)
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
    if (type === "Assert") {
      return {
        type,
        test: this.normalizeNode(node.test)
      };
    }
    if (type === "Break" || type === "Continue") {
      return { type };
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
    if (type === "ForEach") {
      return {
        type,
        kind: node.kind ?? "of",
        target: this.normalizeNode(node.target),
        iterable: this.normalizeNode(node.iterable),
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
    if (type === "ElementRef") {
      return { type, id: node.id ?? "" };
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
    if (type === "TaggedTemplateExpression") {
      return {
        type,
        tag: this.normalizeNode(node.tag),
        template: this.normalizeNode(node.template)
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
    if (type === "ElementDirective") {
      return {
        type,
        element: this.normalizeNode(node.element),
        directive: this.normalizeNode(node.directive)
      };
    }
    if (type === "ElementProperty") {
      return {
        type,
        element: this.normalizeNode(node.element),
        property: node.property ?? ""
      };
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
    const selfRef = this.getGroupProxy(scope);
    const fn = (...args: any[]) => {
      const callScope = scope.createChild ? scope.createChild() : scope;
      const context: ExecutionContext = {
        scope: callScope,
        rootScope: rootScope ?? callScope,
        globals: this.globals,
        engine: this,
        element,
        self: selfRef,
        returnValue: undefined,
        returning: false,
        breaking: false,
        continuing: false
      };
      const previousValues = new Map<string, any>();
      const restore = () => {
        if (callScope === scope) {
          this.restoreFunctionParams(callScope, declaration.params, previousValues);
        }
      };
      let result: any;
      try {
        const paramsResult = this.applyFunctionParams(callScope, declaration.params, previousValues, context, args);
        if (isPromiseLike(paramsResult)) {
          result = Promise.resolve(paramsResult).then(() => declaration.body.evaluate(context));
        } else {
          result = declaration.body.evaluate(context);
        }
      } catch (error) {
        restore();
        throw error;
      }
      if (declaration.isAsync) {
        return Promise.resolve(result).then(() => context.returnValue).finally(restore);
      }
      if (isPromiseLike(result)) {
        return Promise.resolve(result).then(() => context.returnValue).finally(restore);
      }
      restore();
      return context.returnValue;
    };
    scope.setPath(declaration.name, fn);
  }

  private applyFunctionParams(
    scope: Scope,
    params: FunctionParam[],
    previousValues: Map<string, any>,
    context: ExecutionContext,
    args: any[]
  ): void | Promise<void> {
    let argIndex = 0;
    const apply = (index: number): void | Promise<void> => {
      for (let i = index; i < params.length; i += 1) {
        const param = params[i]!;
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
        argIndex += 1;
        if (value === undefined && param.defaultValue) {
          const defaultValue = param.defaultValue.evaluate(context);
          if (isPromiseLike(defaultValue)) {
            return Promise.resolve(defaultValue).then((resolved) => {
              scope.setPath(`self.${name}`, resolved);
              return apply(i + 1);
            });
          }
          value = defaultValue;
        }
        scope.setPath(`self.${name}`, value);
      }
      return undefined;
    };
    return apply(0);
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
    rootScope?: Scope,
    behaviorId?: number
  ): Promise<void> {
    for (const declaration of declarations) {
      await this.applyBehaviorDeclaration(element, scope, declaration, rootScope, behaviorId);
    }
  }

  private async applyBehaviorDeclaration(
    element: Element,
    scope: Scope,
    declaration: DeclarationNode,
    rootScope?: Scope,
    behaviorId?: number
  ): Promise<void> {
    const selfRef = this.getGroupProxy(scope);
    const context: ExecutionContext = { scope, rootScope, globals: this.globals, engine: this, element, self: selfRef };
    const operator = declaration.operator;
    const debounceMs = declaration.flags.debounce
      ? declaration.flagArgs.debounce ?? 200
      : undefined;
    const transform = (value: any) => this.applyCustomFlagTransforms(value, element, scope, declaration);
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
      const transformed = this.applyCustomFlagTransforms(value, element, scope, declaration);
      scope.setPath(declaration.target.name, transformed);
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }

    if (!(declaration.target instanceof DirectiveExpression)) {
      return;
    }

    const target = declaration.target;
    if (behaviorId !== undefined && target.kind === "attr" && target.name === "class") {
      this.trackBehaviorClassMapBinding(element, behaviorId, declaration);
    }
    const exprIdentifier =
      declaration.value instanceof IdentifierExpression ? declaration.value.name : undefined;

    if (operator === ":>") {
      if (exprIdentifier) {
        this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope, transform);
      }
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }

    if (operator === ":=" && exprIdentifier) {
      this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope, transform);
    }

    if (!exprIdentifier) {
      const value = await declaration.value.evaluate(context);
      const transformed = this.applyCustomFlagTransforms(value, element, scope, declaration);
      this.setDirectiveValue(element, target, transformed, declaration);
      const shouldWatch = operator === ":<" || operator === ":=";
      if (shouldWatch) {
        this.applyDirectiveFromExpression(
          element,
          target,
          declaration.value,
          scope,
          debounceMs,
          rootScope,
          declaration,
          behaviorId
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
      debounceMs,
      shouldWatch,
      rootScope,
      declaration,
      behaviorId
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

  private applyCustomFlagTransforms(
    value: any,
    element: Element,
    scope: Scope,
    declaration: DeclarationNode
  ): any {
    if (this.flagHandlers.size === 0) {
      return value;
    }
    let nextValue = value;
    for (const [name, handler] of this.flagHandlers) {
      if (!declaration.flags[name] || !handler.transformValue) {
        continue;
      }
      nextValue = handler.transformValue(
        {
          name,
          args: declaration.flagArgs[name],
          element,
          scope,
          declaration
        },
        nextValue
      );
    }
    return nextValue;
  }

  private async applyBehaviorModifierHook(
    hook: keyof BehaviorModifierHandler,
    behavior: RegisteredBehavior,
    element: Element,
    scope: Scope,
    rootScope?: Scope
  ): Promise<void> {
    if (this.behaviorModifiers.size === 0) {
      return;
    }
    for (const [name, handler] of this.behaviorModifiers) {
      if (!behavior.flags?.[name]) {
        continue;
      }
      const callback = handler[hook];
      if (!callback) {
        continue;
      }
      await callback({
        name,
        args: behavior.flagArgs?.[name],
        element,
        scope,
        rootScope,
        behavior,
        engine: this
      });
    }
  }

  private behaviorHasModifierHooks(behavior: RegisteredBehavior): boolean {
    if (this.behaviorModifiers.size === 0) {
      return false;
    }
    const flags = behavior.flags ?? {};
    for (const name of Object.keys(flags)) {
      if (flags[name] && this.behaviorModifiers.has(name)) {
        return true;
      }
    }
    return false;
  }

  private applyDirectiveFromScope(
    element: Element,
    target: DirectiveExpression,
    expr: string,
    scope: Scope,
    debounceMs?: number,
    watch = true,
    rootScope?: Scope,
    binding?: object,
    behaviorId?: number
  ): void {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const handler = () => {
        const useRoot = expr.startsWith("root.") && rootScope;
        const sourceScope = useRoot ? rootScope : scope;
        const localExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
        this.setHtml(element, sourceScope.get(localExpr.trim()), {
          trusted: Boolean((binding as { flags?: { trusted?: boolean } } | undefined)?.flags?.trusted)
        });
      };
      handler();
      if (watch) {
        const useRoot = expr.startsWith("root.") && rootScope;
        const sourceScope = useRoot ? rootScope : scope;
        const watchExpr = useRoot ? expr.slice("root.".length) : expr;
        this.watchWithDebounce(sourceScope, watchExpr, handler, debounceMs, element, behaviorId);
      }
      return;
    }
    const handler = () => {
      const useRoot = expr.startsWith("root.") && rootScope;
      const sourceScope = useRoot ? rootScope : scope;
      const localExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
      const value = sourceScope.get(localExpr);
      if (value == null) {
        if (target.kind === "attr" && target.name === "class") {
          this.clearClassMapBinding(element, binding ?? target);
        }
        return;
      }
      this.setDirectiveValue(element, target, value, binding);
    };
    handler();
    if (watch) {
      const useRoot = expr.startsWith("root.") && rootScope;
      const sourceScope = useRoot ? rootScope : scope;
      const watchExpr = useRoot ? expr.slice("root.".length) : expr;
      this.watchWithDebounce(sourceScope, watchExpr, handler, debounceMs, element, behaviorId);
    }
  }

  private applyDirectiveFromExpression(
    element: Element,
    target: DirectiveExpression,
    expr: ExpressionNode,
    scope: Scope,
    debounceMs?: number,
    rootScope?: Scope,
    binding?: object,
    behaviorId?: number
  ): void {
    let version = 0;
    if (behaviorId !== undefined) {
      this.trackBehaviorInvalidator(element, behaviorId, () => {
        version += 1;
      });
    }
    const handler = async () => {
      const currentVersion = ++version;
      const selfRef = this.getGroupProxy(scope);
      const context: ExecutionContext = { scope, rootScope, globals: this.globals, engine: this, element, self: selfRef };
      const value = await expr.evaluate(context);
      if (currentVersion !== version) {
        return;
      }
      this.setDirectiveValue(element, target, value, binding);
    };
    void handler();
    this.watchExpression(
      scope,
      rootScope,
      expr,
      () => {
        void handler();
      },
      debounceMs,
      element,
      behaviorId
    );
  }

  private applyDirectiveToScope(
    element: Element,
    target: DirectiveExpression,
    expr: string,
    scope: Scope,
    debounceMs?: number,
    rootScope?: Scope,
    transform?: (value: any) => any
  ): void {
    const useRoot = expr.startsWith("root.") && rootScope;
    const targetScope = useRoot ? rootScope : scope;
    const targetExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
    if (target.kind === "attr" && target.name === "value") {
      this.applyValueBindingToScope(element, targetExpr, debounceMs, targetScope, transform);
      return;
    }
    if (target.kind === "attr" && target.name === "checked") {
      this.applyCheckedBindingToScope(element, targetExpr, debounceMs, targetScope, transform);
      return;
    }
    const value = this.getDirectiveValue(element, target);
    if (value != null) {
      const nextValue = transform ? transform(value) : value;
      targetScope.set(targetExpr, nextValue);
    }
  }

  private applyCheckedBindingToScope(
    element: Element,
    expr: string,
    debounceMs?: number,
    scope?: Scope,
    transform?: (value: any) => any
  ): void {
    if (!(element instanceof HTMLInputElement)) {
      return;
    }
    const handler = () => {
      const targetScope = scope ?? this.getScope(element);
      const value = transform ? transform(element.checked) : element.checked;
      targetScope.set(expr, value);
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
    scope?: Scope,
    transform?: (value: any) => any
  ): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const targetScope = scope ?? this.getScope(element);
      const value = element.value;
      const nextValue = transform ? transform(value) : value;
      targetScope.set(expr, nextValue);
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
    binding?: object
  ): void {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      this.setHtml(element, value, {
        trusted: Boolean((binding as { flags?: { trusted?: boolean } } | undefined)?.flags?.trusted)
      });
      return;
    }
    if (target.kind === "attr") {
      if (target.name === "class") {
        const bindingKey = binding ?? target;
        if (value == null) {
          this.clearClassMapBinding(element, bindingKey);
          return;
        }
        if (this.isClassMapValue(value)) {
          this.applyClassMap(element, value, bindingKey);
          return;
        }
        this.clearClassMapBinding(element, bindingKey);
      }
      if (target.name === "text" && element instanceof HTMLElement) {
        element.innerText = value == null ? "" : String(value);
        return;
      }
      if (target.name === "content" && element instanceof HTMLElement) {
        element.textContent = value == null ? "" : String(value);
        return;
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
      element.setAttribute(target.name, value == null ? "" : String(value));
      return;
    }
    if (target.kind === "style" && element instanceof HTMLElement) {
      element.style.setProperty(target.name, value == null ? "" : String(value));
    }
  }

  private isClassMapValue(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  private applyClassMap(element: Element, value: Record<string, unknown>, binding: object): void {
    const bindings = this.classMapBindings.get(element) ?? new Map<object, Set<string>>();
    const previousKeys = bindings.get(binding) ?? new Set<string>();
    const nextKeys = new Set(Object.keys(value));

    for (const className of nextKeys) {
      if (!className || /\s/.test(className)) {
        throw new Error(`Invalid @class map key '${className}'; keys must be single class names`);
      }
      element.classList.toggle(className, Boolean(value[className]));
    }

    for (const className of previousKeys) {
      if (!nextKeys.has(className)) {
        element.classList.remove(className);
      }
    }

    bindings.set(binding, nextKeys);
    this.classMapBindings.set(element, bindings);
  }

  private clearClassMapBinding(element: Element, binding: object): void {
    const bindings = this.classMapBindings.get(element);
    const previousKeys = bindings?.get(binding);
    if (!previousKeys) {
      return;
    }
    for (const className of previousKeys) {
      element.classList.remove(className);
    }
    bindings?.delete(binding);
  }

  private getDirectiveValue(element: Element, target: DirectiveExpression): unknown {
    if (target.kind === "attr") {
      if (target.name === "text" && element instanceof HTMLElement) {
        return element.innerText;
      }
      if (target.name === "content" && element instanceof HTMLElement) {
        return element.textContent ?? "";
      }
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

  private handleHtmlBehaviors(root: Element): void {
    this.disposeDynamicBehaviors(root);
    const scripts = Array.from(root.querySelectorAll('script[type="text/vsn"]'));
    if (scripts.length === 0 && root.children.length === 0) {
      return;
    }
    if (scripts.length > 0) {
      const source = scripts.map((script) => script.textContent ?? "").join("\n");
      if (source.trim()) {
        this.registerBehaviorSource(source, root);
      }
    }

    const addedRoots = this.scopes.has(root) ? Array.from(root.children) : [root];
    for (const addedRoot of addedRoots) {
      this.ignoredAdded.set(addedRoot, true);
      this.handleAddedNode(addedRoot, false);
    }
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
      handle: (element, _name, value, scope) => {
        this.htmlBindings.set(element, { expr: value, trusted: _name.includes("!trusted") });
        this.markInlineDeclaration(element, "attr:html");
        if (element instanceof HTMLElement) {
          this.setHtml(element, scope.get(value.trim()), { trusted: _name.includes("!trusted") });
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
        const autoLoad = name.includes("!load");
        const url = element.getAttribute(name) ?? "";
        const target = element.getAttribute("vsn-target") ?? undefined;
        const swap = (element.getAttribute("vsn-swap") as "inner" | "outer" | null) ?? "inner";
        const config: GetConfig = {
          url,
          swap,
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
