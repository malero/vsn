import { batch, computed, effect, markNonReactiveProxy, Scope, unwrapReactiveValue } from "./scope";
import type { ComputedGetter, ComputedRef, EffectCallback, EffectOptions, ReactiveOptions } from "./scope";
import { applyBindToElement, applyBindToScope, BindDirection } from "./bindings";
import { applyShow, readCondition } from "./conditionals";
import { applyRequest, RequestError } from "./http";
import type { RequestConfig, RequestResult, RequestStatePaths } from "./http";
import { debounce, Debounced } from "./debounce";
import {
  markTrustedHtml,
  resolveHtmlSanitizer,
  sanitizeVsnMarkup,
  unwrapTrustedHtml
} from "./html-safety";
import type { HtmlSanitizer } from "./html-safety";
import { isAbortError, Lifetime, throwIfAborted } from "./lifetime";
import type { Disposer } from "./lifetime";
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

interface GetBindingConfig extends RequestConfig {
  bodyExpression?: string;
  formSelector?: string;
  headersExpression?: string;
  useForm?: boolean;
  state?: RequestStatePaths;
}

interface LifecycleConfig {
  construct?: string;
  destruct?: string;
  enter?: string;
  leave?: string;
}

type TransitionPhase = "enter" | "leave";

type IfTransition = {
  phase: TransitionPhase;
  cancel: () => void;
};

type IfBinding = {
  element: Element;
  parent: IfBinding | undefined;
  expr: string;
  marker: Comment;
  lifetime: Lifetime;
  active: boolean;
  mounted: boolean;
  suspended: boolean;
  entering: boolean;
  leaving: boolean;
  transition: IfTransition | undefined;
};

export interface RegisteredBehavior {
  id: number;
  hash: string;
  selector: string;
  rootSelector: string;
  parentSelector?: string;
  scopeAlias?: string;
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

type BehaviorScopeAliasBinding = {
  name: string;
  scope: Scope;
  value: Record<string, any>;
};

const behaviorScopeNamePattern = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const reservedBehaviorScopeNames = new Set(["root", "parent", "self", "signal"]);

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
  handle: (
    element: Element,
    name: string,
    value: string,
    scope: Scope,
    context?: AttributeHandlerContext
  ) => boolean | void;
};

export type AttributeHandlerContext = {
  lifetime: Lifetime;
  signal: AbortSignal;
  hydrating: boolean;
  onCleanup: (disposer: Disposer) => Disposer;
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
  process?: boolean;
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
  keyExpr?: string;
  rendered: EachRenderedItem[];
};

type EachRenderedItem = {
  key: unknown;
  scope: Scope;
  roots: Element[];
  nodes: Node[];
  mounted: boolean;
};

type CachedBehavior = {
  construct?: BlockNode;
  destruct?: BlockNode;
  onBlocks: { event: string; body: BlockNode; flags: DeclarationFlags; flagArgs: DeclarationFlagArgs; args: string[] }[];
  declarations: DeclarationNode[];
  functions: FunctionBinding[];
};

export type FlagApplyContext = {
  name: string;
  args: any;
  element: Element;
  scope: Scope;
  declaration: DeclarationNode;
  lifetime: Lifetime;
  signal: AbortSignal;
  onCleanup: (disposer: Disposer) => Disposer;
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
  lifetime: Lifetime;
  signal: AbortSignal;
  hydrating: boolean;
  onCleanup: (disposer: Disposer) => Disposer;
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
  lifetime: Lifetime;
  signal: AbortSignal;
  onCleanup: (disposer: Disposer) => Disposer;
};

export type EngineOptions = {
  diagnostics?: boolean;
  logger?: Partial<Pick<Console, "info" | "warn">>;
  htmlSanitizer?: HtmlSanitizer;
  trustedTypesPolicy?: TrustedTypesPolicy;
  trustedTypesPolicyName?: string;
};

export type HydrationOptions = {
  state?: Record<string, any>;
};

export type TrustedTypesPolicy = {
  createHTML: (value: string) => unknown;
};

export class Engine {
  private static activeEngines = new WeakMap<Document, Engine>();
  private scopes = new WeakMap<Element, Scope>();
  private bindBindings = new WeakMap<Element, BindConfig>();
  private ifBindings = new Map<Element, IfBinding>();
  private showBindings = new WeakMap<Element, string>();
  private htmlBindings = new WeakMap<Element, { expr: string; trusted: boolean }>();
  private getBindings = new WeakMap<Element, GetBindingConfig>();
  private eachBindings = new WeakMap<Element, EachBinding>();
  private lifecycleBindings = new WeakMap<Element, LifecycleConfig>();
  private behaviorRegistry: RegisteredBehavior[] = [];
  private behaviorRegistryHashes = new Set<string>();
  private behaviorEntriesById = new Map<number, RegisteredBehavior>();
  private dynamicBehaviorIds = new WeakMap<Element, Set<number>>();
  private behaviorBoundElements = new Map<number, Set<Element>>();
  private behaviorBindings = new WeakMap<Element, Set<number>>();
  private behaviorRootScopes = new WeakMap<Element, Map<number, Scope>>();
  private behaviorLifetimes = new WeakMap<Element, Map<number, Lifetime>>();
  private inlineLifetimes = new WeakMap<Element, Lifetime>();
  private behaviorId = 0;
  private codeCache = new Map<string, BlockNode>();
  private behaviorCache = new Map<string, CachedBehavior>();
  private observer: MutationObserver | undefined;
  private observerLifetime: Lifetime | undefined;
  private attributeHandlers: AttributeHandler[] = [];
  private htmlTransformers: RegisteredHtmlTransformer[] = [];
  private htmlTransformerOrder = 0;
  private htmlSanitizer: HtmlSanitizer;
  private trustedTypesPolicy: TrustedTypesPolicy | undefined;
  private trustedTypesPolicyName: string;
  private trustedTypesPolicyResolved = false;
  private globals: Record<string, any> = {};
  private importantFlags = new WeakMap<Element, Set<string>>();
  private inlineDeclarations = new WeakMap<Element, Set<string>>();
  private flagHandlers = new Map<string, FlagHandler>();
  private behaviorModifiers = new Map<string, BehaviorModifierHandler>();
  private pendingAdded = new Set<Element>();
  private pendingRemoved = new Set<Element>();
  private pendingUpdated = new Set<Element>();
  private observerFlush: Debounced | undefined;
  private ignoredAdded = new WeakMap<Element, boolean>();
  private ignoredRemoved = new WeakMap<Element, boolean>();
  private diagnostics: boolean;
  private logger: Partial<Pick<Console, "info" | "warn">>;
  private engineLifetime = new Lifetime();
  private pendingUses: Promise<void>[] = [];
  private pendingAutoBindToScope: Array<{ element: Element; expr: string; scope: Scope }> = [];
  private executionStack: Array<{ element?: Element; lifetime?: Lifetime; scope?: Scope }> = [];
  private groupProxyCache = new WeakMap<Scope, Record<string, any>>();
  private behaviorScopeAliases = new WeakMap<Element, Map<number, BehaviorScopeAliasBinding>>();
  private scopeElements = new WeakMap<Scope, Element>();
  private classMapBindings = new WeakMap<Element, Map<object, Set<string>>>();
  private dynamicOwnerCleanupLifetimes = new WeakMap<Element, Lifetime>();
  private mountedRoots = new Set<HTMLElement>();
  private mountedDocuments = new Set<Document>();
  private inactiveSubtrees = new WeakSet<Element>();
  private hydratingElements = new WeakSet<Element>();

  constructor(options: EngineOptions = {}) {
    this.diagnostics = options.diagnostics ?? false;
    this.logger = options.logger ?? console;
    this.htmlSanitizer = options.htmlSanitizer ?? resolveHtmlSanitizer();
    this.trustedTypesPolicy = options.trustedTypesPolicy;
    this.trustedTypesPolicyName = options.trustedTypesPolicyName ?? "vsn";
    this.registerGlobal("console", console);
    this.registerGlobal("batch", batch);
    this.registerGlobal("computed", (nameOrGetter: any, getter?: any) => {
      const scope = this.getCurrentScope();
      if (!scope) {
        throw new Error("Computed state must be created during an engine execution");
      }
      const lifetime = this.getCurrentLifetime();
      const computedOptions = lifetime ? { lifetime } : undefined;
      if (typeof nameOrGetter === "string") {
        if (typeof getter !== "function") {
          throw new TypeError("Named computed state requires a getter function");
        }
        return scope.computed(nameOrGetter, getter, computedOptions);
      }
      if (typeof nameOrGetter !== "function") {
        throw new TypeError("Computed state requires a getter function");
      }
      return computed(scope, nameOrGetter, computedOptions);
    });
    this.registerGlobal("effect", (callback: any) => {
      const scope = this.getCurrentScope();
      if (!scope) {
        throw new Error("Effects must be created during an engine execution");
      }
      if (typeof callback !== "function") {
        throw new TypeError("Effects require a callback function");
      }
      const lifetime = this.getCurrentLifetime();
      const effectOptions = lifetime ? { lifetime } : undefined;
      return effect(scope, callback, effectOptions);
    });
    this.registerGlobal("onCleanup", (disposer: Disposer) => {
      const lifetime = this.getCurrentLifetime();
      return lifetime ? lifetime.onCleanup(disposer) : () => undefined;
    });
    this.registerFlag("important");
    this.registerFlag("trusted", {
      transformValue: ({ declaration }, value) => {
        const target = declaration.target;
        if (target instanceof DirectiveExpression && target.kind === "attr" && target.name === "html") {
          return markTrustedHtml(value);
        }
        return value;
      }
    });
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
    // `as` is a framework-owned modifier. Its binding is installed before
    // declarations run, but registering it here also makes it available to
    // the parser's behavior-modifier allowlist and extension hooks.
    this.registerBehaviorModifier("as", {});
    this.registerBehaviorModifier("group", {
      onConstruct: ({ args, scope, rootScope, behavior, element }) => {
        const key = this.getBehaviorCollectionName(args);
        const targetScope = this.getGroupTargetScope(element, behavior, scope, rootScope);
        if (targetScope.hasAlias?.(key)) {
          throw this.createScopeCollision(
            `Behavior group '${key}' conflicts with a visible behavior scope alias`
          );
        }
        const hasLocalCollection = targetScope.hasLocalBinding?.(key) ?? false;
        const existing = targetScope.getLocal?.(key);
        if (hasLocalCollection && !Array.isArray(existing)) {
          throw this.createScopeCollision(
            `Cannot create behavior group '${key}': the parent behavior scope already defines '${key}'`
          );
        }
        if (!hasLocalCollection) {
          targetScope.setLocal?.(key, []);
        }
        const list = targetScope.getLocal?.(key);
        if (!Array.isArray(list)) {
          throw this.createScopeCollision(`Cannot create behavior group '${key}': its collection is not an array`);
        }
        const proxy = this.getGroupProxy(scope);
        if (!list.includes(proxy)) {
          list.push(proxy);
        }
      },
      onUnbind: ({ args, scope, rootScope, behavior, element }) => {
        const key = this.getBehaviorCollectionName(args);
        const targetScope = this.getGroupTargetScope(element, behavior, scope, rootScope);
        const existing = targetScope.getLocal?.(key);
        if (!Array.isArray(existing)) {
          return;
        }
        const proxy = this.getGroupProxy(scope);
        const next = existing.filter((entry) => entry !== proxy);
        if (next.length !== existing.length) {
          targetScope.setLocal?.(key, next);
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

  private getBehaviorScopeAlias(behavior: BehaviorNode): string | undefined {
    if (!behavior.flags?.as) {
      return undefined;
    }
    const value = behavior.flagArgs?.as;
    const name = typeof value === "string" ? value.trim() : "";
    if (!name) {
      throw new Error("Behavior scope modifier !as(name) requires a name");
    }
    if (!behaviorScopeNamePattern.test(name)) {
      throw new Error(`Invalid behavior scope alias '${name}'`);
    }
    if (reservedBehaviorScopeNames.has(name)) {
      throw new Error(`Behavior scope alias '${name}' is reserved`);
    }
    return name;
  }

  private getBehaviorCollectionName(args: any): string {
    const name = typeof args === "string" ? args.trim() : "";
    if (!name) {
      throw new Error("Behavior group modifier !group(name) requires a name");
    }
    if (!behaviorScopeNamePattern.test(name)) {
      throw this.createScopeCollision(`Invalid behavior group name '${name}'`);
    }
    if (reservedBehaviorScopeNames.has(name)) {
      throw this.createScopeCollision(`Behavior group '${name}' is reserved`);
    }
    return name;
  }

  private createScopeCollision(message: string): Error {
    return new Error(`Scope collision: ${message}`);
  }

  private bindBehaviorScopeAlias(
    behavior: RegisteredBehavior,
    element: Element,
    scope: Scope
  ): BehaviorScopeAliasBinding | undefined {
    const name = behavior.scopeAlias;
    if (!name) {
      return undefined;
    }
    if (scope.hasPath(name)) {
      throw this.createScopeCollision(
        `Behavior scope alias '${name}' conflicts with an existing state or alias`
      );
    }
    const value = this.getGroupProxy(scope);
    scope.defineAlias(name, value);
    const binding: BehaviorScopeAliasBinding = { name, scope, value };
    const aliases = this.behaviorScopeAliases.get(element) ?? new Map<number, BehaviorScopeAliasBinding>();
    aliases.set(behavior.id, binding);
    this.behaviorScopeAliases.set(element, aliases);
    return binding;
  }

  private removeBehaviorScopeAlias(
    element: Element,
    behaviorId: number,
    binding = this.behaviorScopeAliases.get(element)?.get(behaviorId)
  ): void {
    if (!binding) {
      return;
    }
    binding.scope.removeAlias(binding.name, binding.value);
    const aliases = this.behaviorScopeAliases.get(element);
    if (aliases?.get(behaviorId) === binding) {
      aliases.delete(behaviorId);
      if (aliases.size === 0) {
        this.behaviorScopeAliases.delete(element);
      }
    }
  }

  private scheduleBehaviorScopeAliasCleanup(
    element: Element,
    behaviorId: number,
    binding = this.behaviorScopeAliases.get(element)?.get(behaviorId),
    pending: Promise<unknown>[] = []
  ): void {
    if (!binding) {
      return;
    }
    if (pending.length === 0) {
      this.removeBehaviorScopeAlias(element, behaviorId, binding);
      return;
    }
    void Promise.allSettled(pending).then(() => {
      this.removeBehaviorScopeAlias(element, behaviorId, binding);
    });
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
    const nonReactiveProxy = markNonReactiveProxy(proxy);
    this.groupProxyCache.set(scope, nonReactiveProxy);
    return nonReactiveProxy;
  }

  async mount(root: HTMLElement): Promise<void> {
    await this.initializeRoot(root, false);
  }

  /**
   * Attaches VSN to server-rendered markup while preserving DOM values that
   * do not have client state yet.
   */
  async hydrate(root: HTMLElement, options: HydrationOptions = {}): Promise<void> {
    await this.initializeRoot(root, true, options.state);
  }

  private async initializeRoot(
    root: HTMLElement,
    hydrating: boolean,
    state?: Record<string, any>
  ): Promise<void> {
    if (this.engineLifetime.isDisposed) {
      this.engineLifetime = new Lifetime();
    }
    const documentRoot = root.ownerDocument;
    const active = Engine.activeEngines.get(documentRoot);
    if (active && active !== this) {
      active.disposeMountedRoots();
    }
    Engine.activeEngines.set(documentRoot, this);
    this.mountedDocuments.add(documentRoot);
    const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
    if (hydrating) {
      for (const element of elements) {
        this.hydratingElements.add(element);
      }
    }
    for (const element of elements) {
      this.inactiveSubtrees.delete(element);
    }
    if (state) {
      const rootScope = this.getScope(root, this.findParentScope(root));
      for (const [key, value] of Object.entries(state)) {
        rootScope.set(key, value);
      }
    }
    try {
      for (const element of elements) {
        if (element === root && root === root.ownerDocument.body && !this.hasVsnAttributes(element)) {
          continue;
        }
        this.getScope(element, this.findParentScope(element));
      }
      for (const element of elements) {
        if (this.isInactive(element)) {
          continue;
        }
        if (!this.hasVsnAttributes(element)) {
          continue;
        }
        const parentScope = this.findParentScope(element);
        this.getScope(element, parentScope);
        this.attachAttributes(element);
        if (this.isInactive(element)) {
          continue;
        }
        this.runConstruct(element);
      }
      if (hydrating) {
        // Give server-rendered form/display values a chance to become state
        // before behavior declarations initialize their defaults.
        this.flushAutoBindQueue();
      }
      await this.applyBehaviors(root);
    } finally {
      if (hydrating) {
        for (const element of elements) {
          this.hydratingElements.delete(element);
        }
      }
    }
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
    this.disposeIfBindingsInBoundary(element);
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
    if (dynamicOwner) {
      const lifetime = this.getInlineLifetime(dynamicOwner);
      if (this.dynamicOwnerCleanupLifetimes.get(dynamicOwner) !== lifetime) {
        lifetime.onCleanup(() => this.disposeDynamicBehaviors(dynamicOwner));
        this.dynamicOwnerCleanupLifetimes.set(dynamicOwner, lifetime);
      }
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

  registerHtmlSanitizer(sanitizer: HtmlSanitizer): () => void {
    const previous = this.htmlSanitizer;
    this.htmlSanitizer = sanitizer;
    return () => {
      if (this.htmlSanitizer === sanitizer) {
        this.htmlSanitizer = previous;
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
      let timer: ReturnType<typeof setTimeout> | undefined;
      let settled = false;
      const removeCleanup = this.engineLifetime.onCleanup(() => {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
        settled = true;
        resolve();
      });
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        removeCleanup();
        resolve();
      };
      const check = () => {
        if (settled) {
          return;
        }
        const value = this.resolveGlobalPath(use.name);
        if (value !== undefined) {
          this.registerGlobal(use.alias, value);
          finish();
          return;
        }
        if (elapsedMs >= timeoutMs) {
          this.emitUseError(use.name, new Error(`vsn: global '${use.name}' not found`));
          finish();
          return;
        }
        const scheduledDelay = Math.min(delayMs, timeoutMs - elapsedMs);
        timer = setTimeout(() => {
          timer = undefined;
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

  /**
   * Returns the lifetime owned by an element's inline bindings.
   * Extensions can use this for resources that should live until the element
   * is unmounted.
   */
  getLifetime(element: Element): Lifetime {
    return this.inlineLifetimes.get(element) ?? this.getInlineLifetime(element);
  }

  get signal(): AbortSignal {
    return this.engineLifetime.signal;
  }

  batch<T>(callback: () => T): T {
    return batch(callback);
  }

  computed<T>(scope: Scope, getter: ComputedGetter<T>, options?: ReactiveOptions): ComputedRef<T> {
    return computed(scope, getter, options);
  }

  effect(scope: Scope, callback: EffectCallback, options?: EffectOptions): Disposer {
    return effect(scope, callback, options);
  }

  dispose(): void {
    const documents = Array.from(this.mountedDocuments);
    this.disposeMountedRoots();
    try {
      this.engineLifetime.dispose();
    } catch (error) {
      this.logger.warn?.("vsn:error", { error, selector: "engine" });
    }
    for (const documentRoot of documents) {
      if (Engine.activeEngines.get(documentRoot) === this) {
        Engine.activeEngines.delete(documentRoot);
      }
    }
    this.mountedDocuments.clear();
  }

  private getInlineLifetime(element: Element): Lifetime {
    const existing = this.inlineLifetimes.get(element);
    if (existing && !existing.isDisposed) {
      return existing;
    }
    const lifetime = new Lifetime();
    this.inlineLifetimes.set(element, lifetime);
    return lifetime;
  }

  private resetInlineLifetime(element: Element): Lifetime {
    const existing = this.inlineLifetimes.get(element);
    if (existing && !existing.isDisposed) {
      if (this.lifecycleBindings.has(element)) {
        this.runDestruct(element, existing);
      }
      this.disposeLifetime(element, existing);
    }
    const lifetime = new Lifetime();
    this.inlineLifetimes.set(element, lifetime);
    return lifetime;
  }

  private getBehaviorLifetime(element: Element, behaviorId: number): Lifetime {
    const lifetimes = this.behaviorLifetimes.get(element) ?? new Map<number, Lifetime>();
    const existing = lifetimes.get(behaviorId);
    if (existing && !existing.isDisposed) {
      return existing;
    }
    const lifetime = new Lifetime();
    lifetimes.set(behaviorId, lifetime);
    this.behaviorLifetimes.set(element, lifetimes);
    return lifetime;
  }

  private disposeLifetime(element: Element, lifetime: Lifetime): void {
    try {
      lifetime.dispose();
    } catch (error) {
      this.emitError(element, error);
    }
  }

  private disposeBehaviorLifetimes(element: Element): void {
    const lifetimes = this.behaviorLifetimes.get(element);
    if (!lifetimes) {
      return;
    }
    for (const lifetime of lifetimes.values()) {
      this.disposeLifetime(element, lifetime);
    }
    this.behaviorLifetimes.delete(element);
  }

  private addEventListener(
    lifetime: Lifetime,
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(event, handler, options);
    lifetime.onCleanup(() => target.removeEventListener(event, handler, options));
  }

  private cleanupBehaviorBindings(element: Element): void {
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
    bound?.clear();
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

    const trustedValue = unwrapTrustedHtml(transformed);
    if (trustedValue) {
      context.trusted = true;
      transformed = trustedValue.value;
    }

    if (this.isNativeTrustedHtml(transformed)) {
      context.trusted = true;
    }
    const html = transformed == null ? "" : String(transformed);
    const output = context.trusted ? html : sanitizeVsnMarkup(html, this.htmlSanitizer);
    element.innerHTML = this.toTrustedHtml(output) as string;
    if (options.process !== false) {
      this.processHtml(element, { trusted: context.trusted });
    }
  }

  /**
   * Sends a request and optionally applies its HTML response through the
   * engine's sanitizer and behavior processor.
  */
  async request(element: Element, config: RequestConfig): Promise<RequestResult> {
    const requestConfig = config.signal ? config : { ...config, signal: this.engineLifetime.signal };
    return applyRequest(
      element,
      requestConfig,
      (target) => {
        this.handleHtmlBehaviors(target, Boolean(config.trusted));
      },
      (target, html) => {
        this.setHtml(target, html, {
          trusted: Boolean(config.trusted),
          process: false
        });
      }
    );
  }

  private toTrustedHtml(value: unknown): unknown {
    if (this.isNativeTrustedHtml(value)) {
      return value;
    }
    const html = value == null ? "" : String(value);
    const policy = this.getTrustedTypesPolicy();
    return policy ? policy.createHTML(html) : html;
  }

  private isNativeTrustedHtml(value: unknown): boolean {
    const trustedHtml = (globalThis as Record<string, any>).TrustedHTML;
    return typeof trustedHtml === "function" && value instanceof trustedHtml;
  }

  private getTrustedTypesPolicy(): TrustedTypesPolicy | undefined {
    if (this.trustedTypesPolicy) {
      return this.trustedTypesPolicy;
    }
    if (this.trustedTypesPolicyResolved) {
      return undefined;
    }
    this.trustedTypesPolicyResolved = true;
    const trustedTypes = (globalThis as Record<string, any>).trustedTypes;
    if (!trustedTypes || typeof trustedTypes.createPolicy !== "function") {
      return undefined;
    }
    try {
      this.trustedTypesPolicy = trustedTypes.createPolicy(this.trustedTypesPolicyName, {
        createHTML: (html: string) => html
      });
    } catch (error) {
      this.logger.warn?.(
        `vsn: unable to create Trusted Types policy '${this.trustedTypesPolicyName}'. `
        + "Pass a policy through Engine options when Trusted Types enforcement is enabled.",
        error
      );
    }
    return this.trustedTypesPolicy;
  }

  processHtml(root: Element, options: { trusted?: boolean } = {}): void {
    this.handleHtmlBehaviors(root, options.trusted ?? false);
  }

  evaluate(element: Element): void {
    const scope = this.getScope(element);
    const bindConfig = this.bindBindings.get(element);
    if (bindConfig && (bindConfig.direction === "from" || bindConfig.direction === "both")) {
      applyBindToElement(element, bindConfig.expr, scope);
    }
    const ifBinding = this.ifBindings.get(element);
    if (ifBinding) {
      this.updateIfBinding(element, ifBinding);
      if (this.isInactive(element)) {
        return;
      }
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
      const lifetime = this.engineLifetime.child();
      this.observerLifetime = lifetime;
      this.observerFlush = debounce(() => this.flushObserverQueue(), 10);
      lifetime.onCleanup(() => this.observerFlush?.cancel());
      lifetime.onCleanup(() => this.observer?.disconnect());
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
      this.disposeIfBindingsInBoundary(root);
    }
  }

  private disconnectObserver(): void {
    const lifetime = this.observerLifetime;
    this.observerLifetime = undefined;
    if (lifetime) {
      try {
        lifetime.dispose();
      } catch (error) {
        this.logger.warn?.("vsn:error", { error, selector: "observer" });
      }
    } else {
      this.observer?.disconnect();
      this.observerFlush?.cancel();
    }
    this.observer = undefined;
    this.observerFlush = undefined;
    this.pendingAdded.clear();
    this.pendingRemoved.clear();
    this.pendingUpdated.clear();
  }

  private flushObserverQueue(): void {
    const removed = Array.from(this.pendingRemoved);
    this.pendingRemoved.clear();
    for (const node of removed) {
      if (this.ignoredRemoved.has(node)) {
        this.ignoredRemoved.delete(node);
        continue;
      }
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
    this.disposeIfBindingsInBoundary(node);
  }

  private getIfBindingsInBoundary(root: Element): Array<[Element, IfBinding]> {
    const entries: Array<[Element, IfBinding]> = [];
    for (const [element, binding] of this.ifBindings) {
      let parent = binding.parent;
      let related = element === root || root.contains(element) || root.contains(binding.marker);
      while (!related && parent) {
        related = parent.element === root || root.contains(parent.element) || root.contains(parent.marker);
        parent = parent.parent;
      }
      if (related) {
        entries.push([element, binding]);
      }
    }
    return entries;
  }

  private findParentIfBinding(element: Element): IfBinding | undefined {
    let parent = element.parentElement;
    while (parent) {
      const binding = this.ifBindings.get(parent);
      if (binding) {
        return binding;
      }
      parent = parent.parentElement;
    }
    return undefined;
  }

  private disposeIfBinding(element: Element, binding: IfBinding): void {
    this.cancelIfTransition(binding);
    binding.active = false;
    binding.mounted = false;
    binding.suspended = true;
    binding.entering = false;
    binding.leaving = false;
    this.ifBindings.delete(element);
    if (!binding.lifetime.isDisposed) {
      this.disposeLifetime(element, binding.lifetime);
    }
    if (binding.marker.parentNode) {
      binding.marker.parentNode.removeChild(binding.marker);
    }
  }

  private disposeIfBindingsInBoundary(root: Element): void {
    for (const [element, binding] of this.getIfBindingsInBoundary(root)) {
      if (this.ifBindings.get(element) === binding) {
        this.disposeIfBinding(element, binding);
      }
    }
  }

  private getIfTransitionName(element: Element): string | undefined {
    const value = element.getAttribute("vsn-transition");
    if (value === null) {
      return undefined;
    }
    const name = value.trim().split(/\s+/)[0] ?? "";
    if (!name) {
      return "vsn";
    }
    return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(name) ? name : "vsn";
  }

  private parseCssTimes(value: string): number[] {
    if (!value.trim()) {
      return [];
    }
    return value.split(",").map((part) => {
      const match = part.trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(ms|s)$/);
      if (!match) {
        return 0;
      }
      const amount = Number(match[1]);
      return match[2] === "s" ? Math.max(0, amount * 1000) : Math.max(0, amount);
    });
  }

  private getIfTransitionDuration(element: Element): number {
    const view = element.ownerDocument.defaultView;
    if (!view) {
      return 0;
    }
    const style = view.getComputedStyle(element);
    const longest = (durationsValue: string, delaysValue: string): number => {
      const durations = this.parseCssTimes(durationsValue);
      const delays = this.parseCssTimes(delaysValue);
      return durations.reduce((max, duration, index) => {
        const delay = delays[index % (delays.length || 1)] ?? 0;
        return Math.max(max, duration + delay);
      }, 0);
    };
    return Math.max(
      longest(style.transitionDuration, style.transitionDelay),
      longest(style.animationDuration, style.animationDelay)
    );
  }

  private scheduleIfTransitionFrame(element: Element, callback: () => void): () => void {
    const view = element.ownerDocument.defaultView;
    if (view && typeof view.requestAnimationFrame === "function") {
      const frame = view.requestAnimationFrame(callback);
      return () => view.cancelAnimationFrame(frame);
    }
    const timer = setTimeout(callback, 0);
    return () => clearTimeout(timer);
  }

  private cancelIfTransition(binding: IfBinding): void {
    const transition = binding.transition;
    if (!transition) {
      return;
    }
    transition.cancel();
    if (binding.transition === transition) {
      binding.transition = undefined;
    }
  }

  private startIfTransition(
    element: Element,
    binding: IfBinding,
    phase: TransitionPhase,
    onFinish: () => void
  ): void {
    const name = this.getIfTransitionName(element);
    if (!name) {
      onFinish();
      return;
    }

    this.cancelIfTransition(binding);
    const from = `${name}-${phase}`;
    const active = `${name}-${phase}-active`;
    const to = `${name}-${phase}-to`;
    const addedClasses = [from, active].filter((className) => !element.classList.contains(className));
    const addToClass = !element.classList.contains(to);
    element.classList.add(...addedClasses);

    let finished = false;
    let frameCancel: (() => void) | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const onEnd = (event: Event) => {
      if (event.target === element) {
        finish();
      }
    };
    const cleanup = () => {
      frameCancel?.();
      if (timeout) {
        clearTimeout(timeout);
      }
      element.removeEventListener("transitionend", onEnd);
      element.removeEventListener("transitioncancel", onEnd);
      element.removeEventListener("animationend", onEnd);
      element.removeEventListener("animationcancel", onEnd);
      element.classList.remove(...addedClasses);
    };
    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      cleanup();
      if (binding.transition?.cancel === cancel) {
        binding.transition = undefined;
        onFinish();
      }
    };
    const cancel = () => {
      if (finished) {
        return;
      }
      finished = true;
      cleanup();
    };
    const transition: IfTransition = { phase, cancel };
    binding.transition = transition;
    element.addEventListener("transitionend", onEnd);
    element.addEventListener("transitioncancel", onEnd);
    element.addEventListener("animationend", onEnd);
    element.addEventListener("animationcancel", onEnd);

    frameCancel = this.scheduleIfTransitionFrame(element, () => {
      element.classList.remove(from);
      if (addToClass) {
        element.classList.add(to);
        addedClasses.push(to);
      }
      const duration = this.getIfTransitionDuration(element);
      timeout = setTimeout(finish, duration > 0 ? duration + 50 : 0);
    });
  }

  private runIfHook(element: Element, code: string): void {
    void this.safeExecute(code, this.getScope(element), element, undefined, this.getInlineLifetime(element));
  }

  private beginIfEnter(element: Element, binding: IfBinding): void {
    if (binding.suspended || !binding.active || !binding.mounted || binding.entering || binding.leaving) {
      return;
    }
    const lifecycle = this.lifecycleBindings.get(element);
    const transition = this.getIfTransitionName(element);
    if (!lifecycle?.enter && !transition) {
      binding.entering = true;
      return;
    }
    binding.entering = true;
    if (lifecycle?.enter) {
      this.runIfHook(element, lifecycle.enter);
    }
    if (transition) {
      this.startIfTransition(element, binding, "enter", () => undefined);
    }
  }

  private beginIfLeave(element: Element, binding: IfBinding): boolean {
    const lifecycle = this.lifecycleBindings.get(element);
    const transition = this.getIfTransitionName(element);
    if (!lifecycle?.leave && !transition) {
      return false;
    }
    binding.entering = false;
    binding.leaving = true;
    if (lifecycle?.leave) {
      this.runIfHook(element, lifecycle.leave);
    }
    if (transition) {
      this.startIfTransition(element, binding, "leave", () => this.finishDeactivateIf(element, binding));
    } else {
      this.finishDeactivateIf(element, binding);
    }
    return true;
  }

  private ensureIfMarker(element: Element, binding: IfBinding): void {
    const parent = element.parentNode;
    if (!parent || element.contains(binding.marker)) {
      return;
    }
    if (element.nextSibling === binding.marker) {
      return;
    }
    if (binding.marker.parentNode) {
      binding.marker.parentNode.removeChild(binding.marker);
    }
    parent.insertBefore(binding.marker, element.nextSibling);
  }

  private suspendIfDescendants(element: Element, rootBinding: IfBinding): void {
    for (const [boundElement, binding] of this.getIfBindingsInBoundary(element)) {
      if (binding === rootBinding) {
        continue;
      }
      this.cancelIfTransition(binding);
      binding.suspended = true;
      binding.mounted = false;
      binding.entering = false;
      binding.leaving = false;
    }
    const elements = [element, ...Array.from(element.querySelectorAll("*"))];
    for (const current of elements) {
      this.teardownElement(current, {
        preserveIfController: true,
        preserveDynamicBehaviors: true
      });
    }
  }

  private resumeIfDescendants(element: Element): void {
    const descendants = this.getIfBindingsInBoundary(element)
      .filter(([boundElement]) => boundElement !== element);
    for (const [, binding] of descendants) {
      binding.suspended = false;
    }
    for (const [boundElement, binding] of descendants) {
      const active = readCondition(binding.expr, this.getScope(boundElement));
      if (active) {
        binding.active = true;
        if (!binding.mounted) {
          this.activateIf(boundElement, binding);
        }
      } else if (binding.active || binding.mounted || boundElement.parentNode) {
        this.deactivateIf(boundElement, binding);
      }
    }
  }

  private deactivateIf(element: Element, binding: IfBinding): void {
    if (binding.leaving) {
      return;
    }
    const wasMounted = binding.mounted;
    const wasActive = binding.active;
    binding.active = false;
    if (wasMounted || wasActive) {
      if (this.beginIfLeave(element, binding)) {
        return;
      }
      this.finishDeactivateIf(element, binding);
      return;
    }
    const inlineLifetime = this.inlineLifetimes.get(element);
    if (inlineLifetime && !inlineLifetime.isDisposed) {
      this.disposeLifetime(element, inlineLifetime);
    }
    binding.mounted = false;
    this.ensureIfMarker(element, binding);
    const parent = element.parentNode;
    if (!parent) {
      return;
    }
    if (this.observer) {
      this.ignoredRemoved.set(element, true);
    }
    parent.removeChild(element);
  }

  private finishDeactivateIf(element: Element, binding: IfBinding): void {
    if (this.ifBindings.get(element) !== binding || binding.active) {
      return;
    }
    binding.entering = false;
    binding.leaving = false;
    this.suspendIfDescendants(element, binding);
    binding.mounted = false;
    this.ensureIfMarker(element, binding);
    const parent = element.parentNode;
    if (!parent) {
      return;
    }
    if (this.observer) {
      this.ignoredRemoved.set(element, true);
    }
    parent.removeChild(element);
  }

  private activateIf(element: Element, binding: IfBinding): void {
    if (binding.suspended) {
      return;
    }
    if (binding.leaving) {
      this.cancelIfTransition(binding);
      binding.leaving = false;
      binding.entering = false;
      binding.active = true;
      this.beginIfEnter(element, binding);
      this.resumeIfDescendants(element);
      return;
    }
    binding.active = true;
    this.ensureIfMarker(element, binding);
    const markerParent = binding.marker.parentNode;
    if (!markerParent) {
      return;
    }
    if (element.parentNode !== markerParent || element.nextSibling !== binding.marker) {
      if (this.observer && element.parentNode) {
        this.ignoredRemoved.set(element, true);
      }
      if (this.observer) {
        this.ignoredAdded.set(element, true);
      }
      markerParent.insertBefore(element, binding.marker);
    }
    binding.mounted = true;
    for (const [boundElement, descendant] of this.getIfBindingsInBoundary(element)) {
      if (boundElement !== element) {
        descendant.suspended = false;
      }
    }
    this.handleAddedNode(element);
    this.resumeIfDescendants(element);
  }

  private updateIfBinding(element: Element, binding: IfBinding): void {
    if (binding.suspended || (binding.parent && !binding.parent.active)) {
      return;
    }
    const active = readCondition(binding.expr, this.getScope(element));
    if (active) {
      if (!binding.active || !binding.mounted) {
        this.activateIf(element, binding);
      }
      return;
    }
    if (binding.active || binding.mounted || element.parentNode) {
      this.deactivateIf(element, binding);
    }
  }

  private attachIfBinding(element: Element, value: string, scope: Scope): boolean {
    let binding = this.ifBindings.get(element);
    if (binding?.lifetime.isDisposed) {
      this.ifBindings.delete(element);
      binding = undefined;
    }
    if (!binding) {
      binding = {
        element,
        parent: this.findParentIfBinding(element),
        expr: value,
        marker: element.ownerDocument.createComment("vsn-if"),
        lifetime: this.engineLifetime.child(),
        active: false,
        mounted: false,
        suspended: false,
        entering: false,
        leaving: false,
        transition: undefined
      };
      this.ifBindings.set(element, binding);
      const createdBinding = binding;
      this.watch(
        scope,
        value,
        () => this.updateIfBinding(element, createdBinding),
        element,
        undefined,
        createdBinding.lifetime
      );
    } else {
      binding.parent = this.findParentIfBinding(element);
      binding.expr = value;
    }

    const currentBinding = binding;
    this.ensureIfMarker(element, currentBinding);
    const hydrationStateAvailable = this.isHydrating(element) && scope.hasPath(value);
    if (this.isHydrating(element) && !hydrationStateAvailable) {
      // The server already decided that this element is present. Keep it
      // mounted until client state supplies an explicit condition.
      currentBinding.active = true;
      currentBinding.mounted = true;
      currentBinding.suspended = false;
      currentBinding.entering = true;
      return true;
    }
    if (!readCondition(value, scope)) {
      this.deactivateIf(element, currentBinding);
      return false;
    }
    currentBinding.active = true;
    currentBinding.mounted = true;
    currentBinding.suspended = false;
    if (this.isHydrating(element)) {
      // Existing server-rendered DOM is already entered; do not replay an
      // entry transition or hook during hydration.
      currentBinding.entering = true;
    }
    return true;
  }

  private teardownElement(
    element: Element,
    options: { preserveIfController?: boolean; preserveDynamicBehaviors?: boolean } = {}
  ): void {
    const ifBinding = this.ifBindings.get(element);
    if (ifBinding) {
      if (options.preserveIfController) {
        this.cancelIfTransition(ifBinding);
        ifBinding.mounted = false;
        ifBinding.entering = false;
        ifBinding.leaving = false;
      } else {
        this.disposeIfBinding(element, ifBinding);
      }
    }
    const inlineLifetime = this.inlineLifetimes.get(element);
    if (inlineLifetime && !inlineLifetime.isDisposed) {
      if (this.lifecycleBindings.has(element)) {
        this.runDestruct(element, inlineLifetime);
      }
      this.disposeLifetime(element, inlineLifetime);
    }
    if (this.behaviorBindings.has(element)) {
      this.runBehaviorDestruct(element);
      this.disposeBehaviorLifetimes(element);
      this.cleanupBehaviorBindings(element);
    }
    if (!options.preserveDynamicBehaviors) {
      this.disposeDynamicBehaviors(element);
    }
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
      if (element !== node && this.isInactive(element)) {
        continue;
      }
      if (!this.hasVsnAttributes(element)) {
        continue;
      }
      const parentScope = this.findParentScope(element);
      this.getScope(element, parentScope);
      this.attachAttributes(element);
      if (this.isInactive(element)) {
        continue;
      }
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
    if (this.isInactive(root)) {
      return;
    }
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
      if (this.ifBindings.get(current)?.active === false) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  private isHydrating(element: Element): boolean {
    return this.hydratingElements.has(element);
  }

  private async reapplyBehaviorsForElement(element: Element): Promise<void> {
    if (this.behaviorRegistry.length === 0 || this.isInactive(element)) {
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
        if (this.isInactive(element)) {
          return;
        }
      }
    }

    const matchedIds = new Set(matched.map(({ behavior }) => behavior.id));
    for (const behavior of this.behaviorRegistry) {
      if (bound.has(behavior.id) && !matchedIds.has(behavior.id)) {
        this.unbindBehaviorForElement(behavior, element, scope, bound);
      }
    }
    if (!this.isInactive(element)) {
      this.behaviorBindings.set(element, bound);
    }
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
    const lifetime = this.getBehaviorLifetime(element, behavior.id);
    let aliasBinding: BehaviorScopeAliasBinding | undefined;
    try {
      aliasBinding = this.bindBehaviorScopeAlias(behavior, element, scope);
      this.applyBehaviorFunctions(element, scope, behavior.functions, rootScope, lifetime);
      await this.applyBehaviorDeclarations(element, scope, behavior.declarations, rootScope, behavior.id, lifetime);
      if (lifetime.isDisposed) {
        return;
      }
      await this.applyBehaviorModifierHook("onBind", behavior, element, scope, rootScope, lifetime);
      if (lifetime.isDisposed) {
        return;
      }
      if (behavior.construct) {
        await this.safeExecuteBlock(behavior.construct, scope, element, rootScope, lifetime);
      }
      if (lifetime.isDisposed) {
        return;
      }
      await this.applyBehaviorModifierHook("onConstruct", behavior, element, scope, rootScope, lifetime);
      if (lifetime.isDisposed) {
        return;
      }
      for (const onBlock of behavior.onBlocks) {
        this.attachBehaviorOnHandler(
          element,
          onBlock.event,
          onBlock.body,
          onBlock.flags,
          onBlock.flagArgs,
          onBlock.args,
          rootScope,
          lifetime
        );
      }
      this.logDiagnostic("bind", element, behavior);
    } catch (error) {
      const cancelled = lifetime.signal.aborted || isAbortError(error);
      if (aliasBinding) {
        this.removeBehaviorScopeAlias(element, behavior.id, aliasBinding);
      }
      this.logScopeCollision(element, behavior, error);
      this.disposeLifetime(element, lifetime);
      this.behaviorLifetimes.get(element)?.delete(behavior.id);
      if (this.behaviorLifetimes.get(element)?.size === 0) {
        this.behaviorLifetimes.delete(element);
      }
      bound.delete(behavior.id);
      boundElements.delete(element);
      if (boundElements.size === 0) {
        this.behaviorBoundElements.delete(behavior.id);
      }
      this.behaviorRootScopes.get(element)?.delete(behavior.id);
      if (!cancelled) {
        throw error;
      }
    }
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
    const lifetime = this.behaviorLifetimes.get(element)?.get(behavior.id) ?? new Lifetime();
    this.disposeLifetime(element, lifetime);
    this.behaviorLifetimes.get(element)?.delete(behavior.id);
    if (this.behaviorLifetimes.get(element)?.size === 0) {
      this.behaviorLifetimes.delete(element);
    }
    const rootScope = this.getBehaviorRootScope(element, behavior);
    const pending: Promise<unknown>[] = [];
    if (behavior.destruct) {
      pending.push(this.safeExecuteBlock(behavior.destruct, scope, element, rootScope, lifetime, null));
    }
    this.behaviorRootScopes.get(element)?.delete(behavior.id);
    if (this.behaviorHasModifierHooks(behavior)) {
      pending.push(this.applyBehaviorModifierHook("onDestruct", behavior, element, scope, rootScope, lifetime));
      pending.push(this.applyBehaviorModifierHook("onUnbind", behavior, element, scope, rootScope, lifetime));
    }
    this.scheduleBehaviorScopeAliasCleanup(element, behavior.id, undefined, pending);
    this.logDiagnostic("unbind", element, behavior);
  }

  private runBehaviorDestruct(element: Element): void {
    const bound = this.behaviorBindings.get(element);
    if (!bound) {
      return;
    }
    const scope = this.getScope(element);
    for (const behavior of this.behaviorRegistry) {
      const hasModifierHooks = this.behaviorHasModifierHooks(behavior);
      if (!bound.has(behavior.id) || (!behavior.destruct && !hasModifierHooks && !behavior.scopeAlias)) {
        continue;
      }
      const rootScope = this.getBehaviorRootScope(element, behavior);
      const lifetime = this.behaviorLifetimes.get(element)?.get(behavior.id) ?? new Lifetime();
      const pending: Promise<unknown>[] = [];
      if (behavior.destruct) {
        pending.push(this.safeExecuteBlock(behavior.destruct, scope, element, rootScope, lifetime, null));
      }
      if (hasModifierHooks) {
        pending.push(this.applyBehaviorModifierHook("onDestruct", behavior, element, scope, rootScope, lifetime));
        pending.push(this.applyBehaviorModifierHook("onUnbind", behavior, element, scope, rootScope, lifetime));
      }
      this.scheduleBehaviorScopeAliasCleanup(element, behavior.id, undefined, pending);
    }
  }

  private attachAttributes(element: Element): void {
    const scope = this.getScope(element);
    const lifetime = this.resetInlineLifetime(element);
    const context: AttributeHandlerContext = {
      lifetime,
      signal: lifetime.signal,
      hydrating: this.isHydrating(element),
      onCleanup: (disposer) => lifetime.onCleanup(disposer)
    };
    const names = element.getAttributeNames();
    const ifName = names.find((name) => name === "vsn-if");
    if (ifName) {
      const ifHandler = this.attributeHandlers.find((handler) => handler.id === "vsn-if");
      ifHandler?.handle(element, ifName, element.getAttribute(ifName) ?? "", scope, context);
      if (this.isInactive(element)) {
        return;
      }
    }
    for (const name of names) {
      if (name === "vsn-if") {
        continue;
      }
      if (!name.startsWith("vsn-")) {
        continue;
      }
      const value = element.getAttribute(name) ?? "";
      for (const handler of this.attributeHandlers) {
        if (!handler.match(name)) {
          continue;
        }
        const handled = handler.handle(element, name, value, scope, context);
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
    if (this.isInactive(element)) {
      return;
    }
    const config = this.lifecycleBindings.get(element);
    if (config?.construct) {
      const scope = this.getScope(element);
      void this.safeExecute(config.construct, scope, element, undefined, this.getInlineLifetime(element));
    }
    const ifBinding = this.ifBindings.get(element);
    if (ifBinding) {
      this.beginIfEnter(element, ifBinding);
    }
  }

  private runDestruct(element: Element, lifetime = this.getInlineLifetime(element)): void {
    const config = this.lifecycleBindings.get(element);
    if (!config?.destruct) {
      return;
    }
    const scope = this.getScope(element);
    void this.safeExecute(config.destruct, scope, element, undefined, lifetime);
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

  private createEachScope(
    parentScope: Scope,
    binding: EachBinding,
    item: unknown,
    index: number
  ): Scope {
    const itemScope = new Scope(parentScope);
    itemScope.isEachItem = true;
    this.updateEachScope(itemScope, binding, item, index);
    return itemScope;
  }

  private updateEachScope(
    itemScope: Scope,
    binding: EachBinding,
    item: unknown,
    index: number
  ): void {
    // Always notify the item scope. The parent array may have changed an item
    // in place, which emits on the parent scope rather than this child scope.
    // Re-emitting here refreshes item bindings without recreating their DOM.
    itemScope.setPath(`self.${binding.itemName}`, item);
    if (binding.indexName) {
      const currentIndex = itemScope.get(`self.${binding.indexName}`);
      if (!Object.is(currentIndex, index)) {
        itemScope.setPath(`self.${binding.indexName}`, index);
      }
    }
  }

  private createEachItem(
    itemScope: Scope,
    key: unknown
  ): EachRenderedItem {
    return {
      key,
      scope: itemScope,
      roots: [],
      nodes: [],
      mounted: false
    };
  }

  private removeEachItem(item: EachRenderedItem): void {
    for (const root of item.roots) {
      this.handleRemovedNode(root);
    }
    for (const node of item.nodes) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    item.roots = [];
    item.nodes = [];
    item.mounted = false;
  }

  private mountEachItem(
    template: HTMLTemplateElement,
    parent: HTMLElement,
    item: EachRenderedItem,
    anchor: Node
  ): void {
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const nodes = Array.from(fragment.childNodes);
    const roots = nodes.filter((node) => node.nodeType === 1) as Element[];
    item.nodes = nodes;
    item.roots = roots;
    item.mounted = true;

    for (const root of roots) {
      this.getScope(root, item.scope);
      if (this.observer) {
        this.ignoredAdded.set(root, true);
      }
    }
    parent.insertBefore(fragment, anchor);
    for (const root of roots) {
      this.handleAddedNode(root);
      this.evaluate(root);
      for (const child of Array.from(root.querySelectorAll("*"))) {
        this.evaluate(child);
      }
    }
  }

  private placeEachItem(
    template: HTMLTemplateElement,
    parent: HTMLElement,
    item: EachRenderedItem,
    anchor: Node
  ): Node {
    if (!item.mounted) {
      this.mountEachItem(template, parent, item, anchor);
      return item.nodes[0] ?? anchor;
    }

    for (let index = item.nodes.length - 1; index >= 0; index -= 1) {
      const node = item.nodes[index];
      if (!node) {
        continue;
      }
      if (node.nextSibling !== anchor) {
        if (node.nodeType === 1) {
          const element = node as Element;
          if (this.observer && node.parentNode) {
            this.ignoredRemoved.set(element, true);
          }
          if (this.observer) {
            this.ignoredAdded.set(element, true);
          }
        }
        parent.insertBefore(node, anchor);
      }
      anchor = node;
    }
    return anchor;
  }

  private reportEachKeyError(element: Element, message: string): void {
    this.emitError(element, new Error(message));
  }

  private renderUnkeyedEach(
    template: HTMLTemplateElement,
    parent: HTMLElement,
    binding: EachBinding,
    scope: Scope,
    list: any[]
  ): void {
    for (const item of binding.rendered) {
      this.removeEachItem(item);
    }

    const rendered = list.map((item, index) => {
      const itemScope = this.createEachScope(scope, binding, item, index);
      return this.createEachItem(itemScope, index);
    });
    let anchor: Node = template;
    for (let index = rendered.length - 1; index >= 0; index -= 1) {
      const item = rendered[index];
      if (item) {
        anchor = this.placeEachItem(template, parent, item, anchor);
      }
    }
    binding.rendered = rendered;
  }

  private renderKeyedEach(
    template: HTMLTemplateElement,
    parent: HTMLElement,
    binding: EachBinding,
    scope: Scope,
    list: any[]
  ): void {
    const keyExpr = binding.keyExpr ?? "";
    const candidates: Array<{ key: unknown; item: unknown; index: number; scope: Scope }> = [];
    const seenKeys = new Set<unknown>();
    for (let index = 0; index < list.length; index += 1) {
      const item = list[index];
      const itemScope = this.createEachScope(scope, binding, item, index);
      const key = unwrapReactiveValue(itemScope.get(keyExpr));
      if (key === null || key === undefined) {
        this.reportEachKeyError(
          template,
          `vsn-each key '${keyExpr}' returned ${key === null ? "null" : "undefined"} at index ${index}`
        );
        return;
      }
      if (seenKeys.has(key)) {
        this.reportEachKeyError(
          template,
          `vsn-each key '${keyExpr}' returned a duplicate value at index ${index}`
        );
        return;
      }
      seenKeys.add(key);
      candidates.push({ key, item, index, scope: itemScope });
    }

    const previousByKey = new Map<unknown, EachRenderedItem>();
    for (const item of binding.rendered) {
      previousByKey.set(item.key, item);
    }

    const rendered = candidates.map((candidate) => {
      const existing = previousByKey.get(candidate.key);
      if (existing) {
        this.updateEachScope(existing.scope, binding, candidate.item, candidate.index);
        return existing;
      }
      return this.createEachItem(candidate.scope, candidate.key);
    });
    const retained = new Set(rendered);
    for (const item of binding.rendered) {
      if (!retained.has(item)) {
        this.removeEachItem(item);
      }
    }

    const activeElement = parent.ownerDocument.activeElement;
    const selection = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement
      ? {
          start: activeElement.selectionStart,
          end: activeElement.selectionEnd,
          direction: activeElement.selectionDirection
        }
      : undefined;
    let anchor: Node = template;
    for (let index = rendered.length - 1; index >= 0; index -= 1) {
      const item = rendered[index];
      if (item) {
        anchor = this.placeEachItem(template, parent, item, anchor);
      }
    }
    if (activeElement instanceof HTMLElement && activeElement.isConnected && parent.contains(activeElement)) {
      activeElement.focus();
      if (
        selection
        && (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)
        && selection.start !== null
        && selection.end !== null
      ) {
        activeElement.setSelectionRange(selection.start, selection.end, selection.direction ?? "none");
      }
    }
    binding.rendered = rendered;
  }

  private renderEach(element: Element): void {
    const binding = this.eachBindings.get(element);
    if (!binding || !(element instanceof HTMLTemplateElement)) {
      return;
    }
    const parent = element.parentElement;
    if (!parent) {
      return;
    }

    const scope = this.getScope(element);
    const list = scope.get(binding.listExpr);
    if (!Array.isArray(list)) {
      for (const item of binding.rendered) {
        this.removeEachItem(item);
      }
      binding.rendered = [];
      return;
    }
    if (binding.keyExpr) {
      this.renderKeyedEach(element, parent, binding, scope, list);
      return;
    }
    this.renderUnkeyedEach(element, parent, binding, scope, list);
  }

  private attachBindInputHandler(element: Element, expr: string, lifetime = this.getInlineLifetime(element)): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      return;
    }
    const handler = () => {
      const scope = this.getScope(element);
      applyBindToScope(element, expr, scope);
    };
    this.addEventListener(lifetime, element, "input", handler as EventListener);
    this.addEventListener(lifetime, element, "change", handler as EventListener);
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

    const hasScopeValue = this.hasScopeValue(scope, expr);
    const hasHydrationState = this.isHydrating(element) && scope.hasPath(expr);

    if (this.isFormControl(element)) {
      if (hasScopeValue || hasHydrationState) {
        return { direction: "both", seedFromScope: true, syncToScope: false, deferToScope: false };
      }
      return { direction: "both", seedFromScope: false, syncToScope: false, deferToScope: true };
    }

    if (hasScopeValue || hasHydrationState) {
      return {
        direction: "both",
        seedFromScope: hasHydrationState,
        syncToScope: false,
        deferToScope: false
      };
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

  private watch(
    scope: Scope,
    expr: string,
    handler: () => void,
    element?: Element,
    behaviorId?: number,
    lifetime?: Lifetime
  ): void {
    const key = expr.trim();
    if (!key) {
      return;
    }
    const root = key.split(".")[0];
    if (!root) {
      return;
    }
    const owner = lifetime ?? (element ? this.getInlineLifetime(element) : undefined);
    let target: Scope | undefined = scope;
    while (target && !target.hasKey(root)) {
      target = target.parent;
    }
    if (target) {
      target.on(key, handler);
      this.trackScopeWatcher(target, "path", handler, key, owner);
      return;
    }
    let cursor: Scope | undefined = scope;
    while (cursor) {
      cursor.on(key, handler);
      this.trackScopeWatcher(cursor, "path", handler, key, owner);
      cursor = cursor.parent;
    }
  }

  private watchWithDebounce(
    scope: Scope,
    expr: string,
    handler: () => void,
    debounceMs?: number,
    element?: Element,
    behaviorId?: number,
    lifetime?: Lifetime
  ): void {
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    const owner = lifetime ?? (element ? this.getInlineLifetime(element) : undefined);
    if (debounceMs && owner) {
      owner.onCleanup((effectiveHandler as Debounced).cancel);
    }
    this.watch(scope, expr, effectiveHandler, element, behaviorId, owner);
  }

  private watchExpression(
    scope: Scope,
    handler: () => void,
    debounceMs?: number,
    lifetime?: Lifetime
  ): void {
    const owner = lifetime;
    const scheduler = debounceMs
      ? (run: () => void): Disposer => {
          const scheduled = debounce(run, debounceMs);
          scheduled();
          return scheduled.cancel;
        }
      : undefined;
    effect(scope, () => handler(), {
      ...(owner ? { lifetime: owner } : {}),
      ...(scheduler ? { scheduler } : {})
    });
  }

  private trackScopeWatcher(
    scope: Scope,
    kind: "path" | "any",
    handler: () => void,
    key?: string,
    lifetime?: Lifetime
  ): void {
    if (!lifetime) {
      return;
    }
    lifetime.onCleanup(() => {
      if (kind === "any") {
        scope.offAny(handler);
      } else if (key) {
        scope.off(key, handler);
      }
    });
  }

  private trackBehaviorClassMapBinding(element: Element, binding: object, lifetime: Lifetime): void {
    lifetime.onCleanup(() => this.clearClassMapBinding(element, binding));
  }

  private trackBehaviorInvalidator(invalidator: () => void, lifetime: Lifetime): void {
    lifetime.onCleanup(invalidator);
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

  private logScopeCollision(element: Element, behavior: RegisteredBehavior, error: unknown): void {
    if (!this.diagnostics || !this.logger.warn) {
      return;
    }
    if (!(error instanceof Error) || !error.message.startsWith("Scope collision:")) {
      return;
    }
    this.logger.warn("vsn:collision", {
      error,
      selector: this.describeElement(element),
      behaviorId: behavior.id,
      behaviorSelector: behavior.selector,
      scopeAlias: behavior.scopeAlias
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

  private attachOnHandler(
    element: Element,
    config: OnConfig,
    lifetime = this.getInlineLifetime(element)
  ): void {
    const { listenerTarget, options, debounceMs } = this.getEventBindingConfig(
      element,
      config.flags,
      config.flagArgs,
      lifetime
    );
    let effectiveHandler: ((event?: Event) => void) & { cancel?: () => void };
    const handler = async (event?: Event) => {
      if (!element.isConnected || lifetime.isDisposed) {
        listenerTarget.removeEventListener(config.event, effectiveHandler, options);
        return;
      }
      const scope = this.getScope(element);
      if (!this.applyEventFlagBefore(element, scope, config.flags, config.flagArgs, event, lifetime)) {
        return;
      }
      try {
        await this.execute(config.code, scope, element, undefined, lifetime);
        if (!lifetime.isDisposed) {
          this.evaluate(element);
        }
      } catch (error) {
        if (!lifetime.signal.aborted && !isAbortError(error)) {
          this.emitError(element, error);
        }
      } finally {
        this.applyEventFlagAfter(element, scope, config.flags, config.flagArgs, event, lifetime);
      }
    };
    effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    if (debounceMs && effectiveHandler.cancel) {
      lifetime.onCleanup(effectiveHandler.cancel);
    }
    this.addEventListener(lifetime, listenerTarget, config.event, effectiveHandler as EventListener, options);
  }

  private attachBehaviorOnHandler(
    element: Element,
    event: string,
    body: BlockNode,
    flags: DeclarationFlags,
    flagArgs: DeclarationFlagArgs,
    args: string[] | undefined,
    rootScope: Scope | undefined,
    lifetime: Lifetime
  ): void {
    if (event.includes(".")) {
      throw new Error("vsn:on does not support dot modifiers; use !flags instead");
    }
    const { listenerTarget, options, debounceMs } = this.getEventBindingConfig(
      element,
      flags,
      flagArgs,
      lifetime,
      rootScope
    );
    const handler = async (evt?: Event) => {
      if (lifetime.isDisposed) {
        return;
      }
      const scope = this.getScope(element);
      if (!this.applyEventFlagBefore(element, scope, flags, flagArgs, evt, lifetime, rootScope)) {
        return;
      }
      const previousValues = new Map<string, any>();
      if (args && args.length > 0) {
        const argName = args[0];
        if (argName) {
          previousValues.set(argName, scope.getPath(argName));
          const [nextArg] = this.applyEventFlagArgTransforms(
            element,
            scope,
            flags,
            flagArgs,
            evt,
            lifetime,
            rootScope
          );
          scope.setPath(argName, nextArg);
        }
      }
      let failed = false;
      try {
        await this.executeBlock(body, scope, element, rootScope, lifetime);
      } catch (error) {
        failed = true;
        if (!lifetime.signal.aborted && !isAbortError(error)) {
          this.emitError(element, error);
        }
      } finally {
        for (const [name, value] of previousValues.entries()) {
          scope.setPath(name, value);
        }
        this.applyEventFlagAfter(element, scope, flags, flagArgs, evt, lifetime, rootScope);
      }
      if (!failed && !lifetime.isDisposed) {
        this.evaluate(element);
      }
    };
    const effectiveHandler = debounceMs ? debounce(handler, debounceMs) : handler;
    if (debounceMs) {
      lifetime.onCleanup((effectiveHandler as Debounced).cancel);
    }
    this.addEventListener(lifetime, listenerTarget, event, effectiveHandler as EventListener, options);
  }

  private attachGetHandler(
    element: Element,
    autoLoad = false,
    lifetime = this.getInlineLifetime(element)
  ): void {
    let requestLifetime: Lifetime | undefined;
    const handler = async (event?: Event) => {
      if (lifetime.isDisposed || !element.isConnected) {
        return;
      }
      requestLifetime?.dispose();
      const operationLifetime = lifetime.child();
      requestLifetime = operationLifetime;
      const config = this.getBindings.get(element);
      if (!config) {
        operationLifetime.dispose();
        return;
      }
      const scope = this.getScope(element);
      const isCurrent = () => (
        requestLifetime === operationLifetime
        && !operationLifetime.signal.aborted
        && !lifetime.isDisposed
      );
      const setState = (path: string | undefined, value: unknown) => {
        if (isCurrent() && path?.trim()) {
          scope.setPath(path, value);
        }
      };
      try {
        this.batch(() => {
          setState(config.state?.loading, true);
          setState(config.state?.error, "");
          setState(config.state?.data, undefined);
        });

        const form = this.resolveRequestForm(element, config.formSelector, config.useForm);
        const submitter = this.resolveRequestSubmitter(element, event);
        const body = config.bodyExpression === undefined
          ? config.body
          : this.resolveRequestValue(element, config.bodyExpression);
        const headers = config.headersExpression === undefined
          ? config.headers
          : this.resolveRequestHeaders(element, config.headersExpression);

        const result = await this.request(
          element,
          {
            ...config,
            ...(body === undefined ? {} : { body }),
            ...(headers === undefined ? {} : { headers }),
            ...(form ? { form } : {}),
            ...(submitter ? { submitter } : {}),
            signal: operationLifetime.signal
          }
        );
        if (!isCurrent()) {
          return;
        }
        this.batch(() => {
          setState(config.state?.data, result.body);
          setState(config.state?.loading, false);
        });
      } catch (error) {
        if (!isCurrent() || isAbortError(error)) {
          return;
        }
        const message = error instanceof Error ? error.message : String(error);
        this.batch(() => {
          setState(config.state?.error, message);
          setState(config.state?.data, undefined);
          setState(config.state?.loading, false);
        });
        console.warn("vsn:getError", error);
        const detail = error instanceof RequestError
          ? {
              error,
              response: error.response,
              status: error.status,
              statusText: error.statusText
            }
          : { error };
        element.dispatchEvent(new CustomEvent("vsn:getError", { detail, bubbles: true }));
      } finally {
        if (requestLifetime === operationLifetime) {
          requestLifetime = undefined;
        }
        operationLifetime.dispose();
      }
    };

    if (element instanceof HTMLFormElement) {
      const submitHandler = (event: Event) => {
        event.preventDefault();
        void handler(event);
      };
      this.addEventListener(lifetime, element, "submit", submitHandler);
    } else {
      const clickHandler = (event: Event) => {
        const target = event.target;
        const clickedTriggerDescendant = target instanceof Node
          && target !== element
          && (element instanceof HTMLAnchorElement || element instanceof HTMLButtonElement)
          && element.contains(target);
        if (target !== element && !clickedTriggerDescendant) {
          return;
        }
        event.preventDefault();
        void handler(event);
      };
      this.addEventListener(lifetime, element, "click", clickHandler);
    }
    if (autoLoad) {
      Promise.resolve().then(() => void handler());
    }
  }

  private resolveRequestForm(
    element: Element,
    selector?: string,
    useForm = false
  ): HTMLFormElement | undefined {
    if (selector?.trim()) {
      let candidate: Element | null = null;
      try {
        candidate = element.ownerDocument.querySelector(selector);
      } catch {
        throw new Error(`Invalid vsn-form selector '${selector}'`);
      }
      if (!(candidate instanceof HTMLFormElement)) {
        throw new Error(`vsn-form selector '${selector}' did not match a form`);
      }
      return candidate;
    }
    if (element instanceof HTMLFormElement) {
      return element;
    }
    if (!useForm) {
      return undefined;
    }
    const form = element.closest("form");
    if (!(form instanceof HTMLFormElement)) {
      throw new Error("vsn-get!form requires a containing form");
    }
    return form;
  }

  private resolveRequestSubmitter(element: Element, event?: Event): HTMLElement | undefined {
    const submitter = typeof SubmitEvent !== "undefined" && event instanceof SubmitEvent
      ? event.submitter
      : undefined;
    if (submitter instanceof HTMLElement) {
      return submitter;
    }
    return element instanceof HTMLElement && !(element instanceof HTMLFormElement) ? element : undefined;
  }

  private resolveRequestValue(element: Element, expression: string): unknown {
    const source = expression.trim();
    if (!source) {
      return undefined;
    }
    const scope = this.getScope(element);
    if (scope.hasPath(source)) {
      return scope.getPath(source);
    }
    try {
      return JSON.parse(source);
    } catch {
      return source;
    }
  }

  private resolveRequestHeaders(element: Element, expression: string): HeadersInit | undefined {
    const value = this.resolveRequestValue(element, expression);
    if (value == null || value === "") {
      return undefined;
    }
    if (typeof value === "object") {
      return value as HeadersInit;
    }
    throw new TypeError("vsn-headers must resolve to an object, Headers, or header pairs");
  }

  private getEventBindingConfig(
    element: Element,
    flags: DeclarationFlags,
    flagArgs: DeclarationFlagArgs,
    lifetime: Lifetime,
    rootScope?: Scope
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
        rootScope,
        event: undefined,
        engine: this,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
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
    event: Event | undefined,
    lifetime: Lifetime,
    rootScope?: Scope
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
        rootScope,
        event,
        engine: this,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
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
    event: Event | undefined,
    lifetime: Lifetime,
    rootScope?: Scope
  ): void {
    if (lifetime.isDisposed) {
      return;
    }
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
        rootScope,
        event,
        engine: this,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
      });
    }
  }

  private applyEventFlagArgTransforms(
    element: Element,
    scope: Scope,
    flags: DeclarationFlags,
    flagArgs: DeclarationFlagArgs,
    event: Event | undefined,
    lifetime: Lifetime,
    rootScope?: Scope
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
          rootScope,
          event,
          engine: this,
          lifetime,
          signal: lifetime.signal,
          onCleanup: (disposer) => lifetime.onCleanup(disposer)
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

  private withExecutionFrame<T>(
    element: Element | undefined,
    lifetime: Lifetime | undefined,
    fn: () => T,
    scope?: Scope
  ): T {
    if (!element && !lifetime && !scope) {
      return fn();
    }
    this.executionStack.push({
      ...(element ? { element } : {}),
      ...(lifetime ? { lifetime } : {}),
      ...(scope ? { scope } : {})
    });
    const pop = () => {
      this.executionStack.pop();
    };
    let result: T;
    try {
      result = fn();
    } catch (error) {
      pop();
      throw error;
    }
    if (isPromiseLike(result)) {
      return Promise.resolve(result).finally(pop) as unknown as T;
    }
    pop();
    return result;
  }

  withExecutionContext<T>(
    element: Element | undefined,
    lifetime: Lifetime | undefined,
    fn: () => T,
    scope?: Scope
  ): T {
    return this.withExecutionFrame(element, lifetime, fn, scope);
  }

  private async withExecutionElement(
    element: Element | undefined,
    lifetime: Lifetime | undefined,
    fn: () => Promise<void>,
    scope?: Scope
  ): Promise<void> {
    await this.withExecutionFrame(element, lifetime, fn, scope);
  }

  getCurrentElement(): Element | undefined {
    return this.executionStack[this.executionStack.length - 1]?.element;
  }

  getCurrentLifetime(): Lifetime | undefined {
    return this.executionStack[this.executionStack.length - 1]?.lifetime;
  }

  getCurrentScope(): Scope | undefined {
    return this.executionStack[this.executionStack.length - 1]?.scope;
  }

  private async execute(
    code: string,
    scope: Scope,
    element?: Element,
    rootScope?: Scope,
    lifetime?: Lifetime
  ): Promise<void> {
    throwIfAborted(lifetime?.signal);
    let block = this.codeCache.get(code);
    if (!block) {
      block = Parser.parseInline(code);
      this.codeCache.set(code, block);
    }
    await batch(() => this.withExecutionElement(element, lifetime, async () => {
      const selfRef = this.getGroupProxy(scope);
      const context: ExecutionContext = {
        scope,
        rootScope,
        globals: this.globals,
        engine: this,
        ...(element ? { element } : {}),
        self: selfRef,
        ...(lifetime ? { lifetime, signal: lifetime.signal } : {})
      };
      await block.evaluate(context);
    }, scope));
  }

  private async executeBlock(
    block: BlockNode,
    scope: Scope,
    element?: Element,
    rootScope?: Scope,
    lifetime?: Lifetime,
    signal: AbortSignal | null | undefined = lifetime?.signal
  ): Promise<void> {
    throwIfAborted(signal);
    await batch(() => this.withExecutionElement(element, lifetime, async () => {
      const selfRef = this.getGroupProxy(scope);
      const context: ExecutionContext = {
        scope,
        rootScope,
        globals: this.globals,
        engine: this,
        ...(element ? { element } : {}),
        self: selfRef,
        ...(lifetime ? { lifetime, ...(signal ? { signal } : {}) } : {})
      };
      await block.evaluate(context);
    }, scope));
  }

  private async safeExecute(
    code: string,
    scope: Scope,
    element?: Element,
    rootScope?: Scope,
    lifetime?: Lifetime
  ): Promise<void> {
    try {
      await this.execute(code, scope, element, rootScope, lifetime);
    } catch (error) {
      if (element && !lifetime?.signal.aborted && !isAbortError(error)) {
        this.emitError(element, error);
      }
    }
  }

  private async safeExecuteBlock(
    block: BlockNode,
    scope: Scope,
    element?: Element,
    rootScope?: Scope,
    lifetime?: Lifetime,
    signal: AbortSignal | null | undefined = lifetime?.signal
  ): Promise<void> {
    try {
      await this.executeBlock(block, scope, element, rootScope, lifetime, signal);
    } catch (error) {
      if (element && !signal?.aborted && !isAbortError(error)) {
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
    const scopeAlias = this.getBehaviorScopeAlias(behavior);
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
      ...(scopeAlias ? { scopeAlias } : {}),
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
    rootScope: Scope | undefined,
    lifetime: Lifetime
  ): void {
    for (const declaration of functions) {
      this.applyBehaviorFunction(element, scope, declaration, rootScope, lifetime);
    }
  }

  private applyBehaviorFunction(
    element: Element,
    scope: Scope,
    declaration: FunctionBinding,
    rootScope: Scope | undefined,
    lifetime: Lifetime
  ): void {
    const existing = scope.getPath(declaration.name);
    if (existing !== undefined && typeof existing !== "function") {
      throw new Error(`Cannot override non-function '${declaration.name}' with a function`);
    }
    const selfRef = this.getGroupProxy(scope);
    const fn = (...args: any[]) => {
      if (lifetime.isDisposed && !lifetime.isDisposing) {
        return undefined;
      }
      const signal = lifetime.isDisposing ? undefined : lifetime.signal;
      const callScope = scope.createChild ? scope.createChild() : scope;
      return batch(() => this.withExecutionContext(element, lifetime, () => {
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
          continuing: false,
          lifetime,
          ...(signal ? { signal } : {})
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
      }, callScope));
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
    behaviorId?: number,
    lifetime?: Lifetime
  ): Promise<void> {
    for (const declaration of declarations) {
      if (lifetime?.isDisposed) {
        return;
      }
      await this.applyBehaviorDeclaration(element, scope, declaration, rootScope, behaviorId, lifetime);
    }
  }

  private async applyBehaviorDeclaration(
    element: Element,
    scope: Scope,
    declaration: DeclarationNode,
    rootScope?: Scope,
    behaviorId?: number,
    lifetime?: Lifetime
  ): Promise<void> {
    const selfRef = this.getGroupProxy(scope);
    const context: ExecutionContext = {
      scope,
      rootScope,
      globals: this.globals,
      engine: this,
      element,
      self: selfRef,
      ...(lifetime ? { lifetime, signal: lifetime.signal } : {})
    };
    const operator = declaration.operator;
    const debounceMs = declaration.flags.debounce
      ? declaration.flagArgs.debounce ?? 200
      : undefined;
    const transform = (value: any) => this.applyCustomFlagTransforms(value, element, scope, declaration, lifetime);
    const importantKey = this.getImportantKey(declaration);
    if (!declaration.flags.important && importantKey && this.isImportant(element, importantKey)) {
      return;
    }
    if (importantKey && this.isInlineDeclaration(element, importantKey)) {
      return;
    }
    if (!lifetime) {
      return;
    }
    this.applyCustomFlags(element, scope, declaration, lifetime);

    if (declaration.target instanceof IdentifierExpression) {
      if (this.isHydrating(element) && scope.hasPath(declaration.target.name)) {
        // Server state is authoritative during hydration; declarations remain
        // initializers for values that were not supplied by the server.
        return;
      }
      const value = await declaration.value.evaluate(context);
      if (lifetime.isDisposed) {
        return;
      }
      const transformed = this.applyCustomFlagTransforms(value, element, scope, declaration, lifetime);
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
      this.trackBehaviorClassMapBinding(element, declaration, lifetime);
    }
    const exprIdentifier =
      declaration.value instanceof IdentifierExpression ? declaration.value.name : undefined;

    if (operator === ":>") {
      if (exprIdentifier) {
        this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope, transform, lifetime);
      }
      if (declaration.flags.important && importantKey) {
        this.markImportant(element, importantKey);
      }
      return;
    }

    if (operator === ":=" && exprIdentifier) {
      this.applyDirectiveToScope(element, target, exprIdentifier, scope, debounceMs, rootScope, transform, lifetime);
    }

    if (!exprIdentifier) {
      const shouldWatch = operator === ":<" || operator === ":=";
      if (shouldWatch) {
        await this.applyDirectiveFromExpression(
          element,
          target,
          declaration.value,
          scope,
          debounceMs,
          rootScope,
          declaration,
          behaviorId,
          lifetime,
          transform
        );
      } else {
        const value = await declaration.value.evaluate(context);
        if (lifetime.isDisposed) {
          return;
        }
        const transformed = this.applyCustomFlagTransforms(value, element, scope, declaration, lifetime);
        this.setDirectiveValue(element, target, transformed, declaration);
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
      behaviorId,
      lifetime
    );
    if (declaration.flags.important && importantKey) {
      this.markImportant(element, importantKey);
    }
  }

  private applyCustomFlags(
    element: Element,
    scope: Scope,
    declaration: DeclarationNode,
    lifetime: Lifetime
  ): void {
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
        declaration,
        lifetime,
        signal: lifetime.signal,
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
      });
    }
  }

  private applyCustomFlagTransforms(
    value: any,
    element: Element,
    scope: Scope,
    declaration: DeclarationNode,
    lifetime?: Lifetime
  ): any {
    if (this.flagHandlers.size === 0) {
      return value;
    }
    const owner = lifetime ?? this.getInlineLifetime(element);
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
          declaration,
          lifetime: owner,
          signal: owner.signal,
          onCleanup: (disposer) => owner.onCleanup(disposer)
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
    rootScope: Scope | undefined,
    lifetime: Lifetime
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
        engine: this,
        lifetime,
        signal: lifetime.signal,
        hydrating: this.isHydrating(element),
        onCleanup: (disposer) => lifetime.onCleanup(disposer)
      });
    }
  }

  private behaviorHasModifierHooks(behavior: RegisteredBehavior): boolean {
    if (this.behaviorModifiers.size === 0) {
      return false;
    }
    const flags = behavior.flags ?? {};
    for (const name of Object.keys(flags)) {
      const handler = this.behaviorModifiers.get(name);
      if (
        flags[name]
        && handler
        && ["onBind", "onConstruct", "onDestruct", "onUnbind"].some(
          (hook) => typeof handler[hook as keyof BehaviorModifierHandler] === "function"
        )
      ) {
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
    behaviorId?: number,
    lifetime?: Lifetime
  ): void {
    if (target.kind === "attr" && target.name === "html" && element instanceof HTMLElement) {
      const handler = () => {
        if (lifetime?.isDisposed) {
          return;
        }
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
        this.watchWithDebounce(sourceScope, watchExpr, handler, debounceMs, element, behaviorId, lifetime);
      }
      return;
    }
    const handler = () => {
      if (lifetime?.isDisposed) {
        return;
      }
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
      this.watchWithDebounce(sourceScope, watchExpr, handler, debounceMs, element, behaviorId, lifetime);
    }
  }

  private async applyDirectiveFromExpression(
    element: Element,
    target: DirectiveExpression,
    expr: ExpressionNode,
    scope: Scope,
    debounceMs?: number,
    rootScope?: Scope,
    binding?: object,
    behaviorId?: number,
    lifetime?: Lifetime,
    transform?: (value: any) => any
  ): Promise<void> {
    let version = 0;
    if (lifetime) {
      this.trackBehaviorInvalidator(() => {
        version += 1;
      }, lifetime);
    }
    const handler = async () => {
      if (lifetime?.isDisposed) {
        return;
      }
      throwIfAborted(lifetime?.signal);
      const currentVersion = ++version;
      const selfRef = this.getGroupProxy(scope);
      const context: ExecutionContext = {
        scope,
        rootScope,
        globals: this.globals,
        engine: this,
        element,
        self: selfRef,
        ...(lifetime ? { lifetime, signal: lifetime.signal } : {})
      };
      const applyValue = (value: any): void => {
        if (currentVersion !== version || lifetime?.isDisposed) {
          return;
        }
        const transformed = transform ? transform(value) : value;
        this.setDirectiveValue(element, target, transformed, binding);
      };
      const evaluated = expr.evaluate(context);
      if (isPromiseLike(evaluated)) {
        applyValue(await evaluated);
      } else {
        applyValue(evaluated);
      }
    };
    let firstRun: Promise<void> | undefined;
    const reportError = (error: unknown) => {
      if (!lifetime?.signal.aborted && !isAbortError(error)) {
        this.emitError(element, error);
      }
    };
    const run = () => {
      const pending = handler();
      if (!firstRun) {
        firstRun = pending.catch((error) => {
          reportError(error);
        });
        return;
      }
      void pending.catch(reportError);
    };
    this.watchExpression(scope, run, debounceMs, lifetime);
    if (firstRun) {
      await firstRun;
    }
  }

  private applyDirectiveToScope(
    element: Element,
    target: DirectiveExpression,
    expr: string,
    scope: Scope,
    debounceMs?: number,
    rootScope?: Scope,
    transform?: (value: any) => any,
    lifetime?: Lifetime
  ): void {
    const useRoot = expr.startsWith("root.") && rootScope;
    const targetScope = useRoot ? rootScope : scope;
    const targetExpr = useRoot ? `self.${expr.slice("root.".length)}` : expr;
    if (target.kind === "attr" && target.name === "value") {
      this.applyValueBindingToScope(element, targetExpr, debounceMs, targetScope, transform, lifetime);
      return;
    }
    if (target.kind === "attr" && target.name === "checked") {
      this.applyCheckedBindingToScope(element, targetExpr, debounceMs, targetScope, transform, lifetime);
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
    transform?: (value: any) => any,
    lifetime?: Lifetime
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
    const owner = lifetime ?? this.getInlineLifetime(element);
    if (debounceMs) {
      owner.onCleanup((effectiveHandler as Debounced).cancel);
    }
    effectiveHandler();
    this.addEventListener(owner, element, "change", effectiveHandler as EventListener);
    this.addEventListener(owner, element, "input", effectiveHandler as EventListener);
  }

  private applyValueBindingToScope(
    element: Element,
    expr: string,
    debounceMs?: number,
    scope?: Scope,
    transform?: (value: any) => any,
    lifetime?: Lifetime
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
    const owner = lifetime ?? this.getInlineLifetime(element);
    if (debounceMs) {
      owner.onCleanup((effectiveHandler as Debounced).cancel);
    }
    effectiveHandler();
    this.addEventListener(owner, element, "input", effectiveHandler as EventListener);
    this.addEventListener(owner, element, "change", effectiveHandler as EventListener);
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

  private handleHtmlBehaviors(root: Element, trusted = false): void {
    this.disposeDynamicBehaviors(root);
    const scripts = Array.from(root.querySelectorAll('script[type="text/vsn"]'));
    if (!trusted) {
      for (const script of scripts) {
        script.remove();
      }
    }
    if (scripts.length === 0 && root.children.length === 0) {
      return;
    }
    if (trusted && scripts.length > 0) {
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
        return this.attachIfBinding(element, value, scope);
      }
    });

    this.registerAttributeHandler({
      id: "vsn-show",
      match: (name) => name === "vsn-show",
      handle: (element, _name, value, scope) => {
        this.showBindings.set(element, value);
        if (element instanceof HTMLElement && !(this.isHydrating(element) && !scope.hasPath(value))) {
          applyShow(element, value, scope);
        }
        this.watch(scope, value, () => this.evaluate(element), element);
      }
    });

    this.registerAttributeHandler({
      id: "vsn-text",
      match: (name) => name === "vsn-text",
      handle: (element, _name, value, scope) => {
        if (!(element instanceof HTMLElement)) {
          return;
        }
        const update = () => {
          const nextValue = scope.get(value.trim());
          element.textContent = nextValue == null ? "" : String(nextValue);
        };
        if (!(this.isHydrating(element) && !scope.hasPath(value))) {
          update();
        }
        this.watch(scope, value, update, element);
      }
    });

    this.registerAttributeHandler({
      id: "vsn-html",
      match: (name) => name === "vsn-html" || name.startsWith("vsn-html!"),
      handle: (element, _name, value, scope) => {
        const trusted = _name.split("!").includes("trusted");
        this.htmlBindings.set(element, { expr: value, trusted });
        this.markInlineDeclaration(element, "attr:html");
        if (element instanceof HTMLElement && !(this.isHydrating(element) && !scope.hasPath(value))) {
          this.setHtml(element, scope.get(value.trim()), { trusted });
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
        const keyExpr = element.getAttribute("vsn-key")?.trim() || undefined;
        this.eachBindings.set(element, {
          ...config,
          ...(keyExpr ? { keyExpr } : {}),
          rendered: []
        });
        this.renderEach(element);
        this.watch(scope, config.listExpr, () => this.renderEach(element), element);
      }
    });

    this.registerAttributeHandler({
      id: "vsn-get",
      match: (name) => name === "vsn-get" || name.startsWith("vsn-get!"),
      handle: (element, name, _value, _scope, context) => {
        const modifiers = new Set(name.split("!").slice(1));
        const autoLoad = modifiers.has("load");
        const trusted = modifiers.has("trusted");
        const url = element.getAttribute(name) ?? "";
        const target = element.getAttribute("vsn-target") ?? undefined;
        const swapAttribute = element.getAttribute("vsn-swap")?.trim();
        const swap = swapAttribute === "outer" || swapAttribute === "none" ? swapAttribute : "inner";
        const historyAttribute = element.getAttribute("vsn-history")?.trim().toLowerCase();
        const history = historyAttribute === "push" || historyAttribute === "replace" || historyAttribute === "none"
          ? historyAttribute
          : modifiers.has("push")
            ? "push"
            : modifiers.has("replace")
              ? "replace"
              : undefined;
        const focusAttribute = element.getAttribute("vsn-focus");
        const restoreFocus = focusAttribute === null
          ? (modifiers.has("focus") ? true : undefined)
          : focusAttribute.trim() === "" || focusAttribute.trim().toLowerCase() === "true"
            ? true
            : focusAttribute.trim().toLowerCase() === "false"
              ? false
              : focusAttribute.trim();
        const formSelector = element.getAttribute("vsn-form");
        const loadingPath = element.getAttribute("vsn-loading")?.trim() || undefined;
        const errorPath = element.getAttribute("vsn-error")?.trim() || undefined;
        const dataPath = element.getAttribute("vsn-data")?.trim() || undefined;
        const state: RequestStatePaths = {
          ...(loadingPath ? { loading: loadingPath } : {}),
          ...(errorPath ? { error: errorPath } : {}),
          ...(dataPath ? { data: dataPath } : {})
        };
        const method = element.getAttribute("vsn-method")?.trim();
        const bodyExpression = element.getAttribute("vsn-body");
        const headersExpression = element.getAttribute("vsn-headers");
        const config: GetBindingConfig = {
          url,
          swap,
          trusted,
          ...(method ? { method } : {}),
          ...(target ? { targetSelector: target } : {}),
          ...(bodyExpression === null ? {} : { bodyExpression }),
          ...(headersExpression === null ? {} : { headersExpression }),
          ...(formSelector === null ? {} : { formSelector }),
          ...(element instanceof HTMLFormElement || modifiers.has("form") || formSelector !== null
            ? { useForm: true }
            : {}),
          ...(history ? { history } : {}),
          ...(element.hasAttribute("vsn-history-url")
            ? { historyUrl: element.getAttribute("vsn-history-url") ?? "" }
            : {}),
          ...(restoreFocus === undefined ? {} : { restoreFocus }),
          ...(Object.keys(state).length > 0 ? { state } : {})
        };
        this.getBindings.set(element, config);
        this.attachGetHandler(element, autoLoad, context?.lifetime);
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
      id: "vsn-enter",
      match: (name) => name === "vsn-enter",
      handle: (element, _name, value) => {
        this.setLifecycle(element, { enter: value });
      }
    });

    this.registerAttributeHandler({
      id: "vsn-leave",
      match: (name) => name === "vsn-leave",
      handle: (element, _name, value) => {
        this.setLifecycle(element, { leave: value });
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
