declare enum TokenType {
    Whitespace = "Whitespace",
    Identifier = "Identifier",
    Number = "Number",
    String = "String",
    Template = "Template",
    Boolean = "Boolean",
    Null = "Null",
    Behavior = "Behavior",
    Use = "Use",
    State = "State",
    On = "On",
    Construct = "Construct",
    Destruct = "Destruct",
    Return = "Return",
    If = "If",
    Else = "Else",
    For = "For",
    While = "While",
    Try = "Try",
    Catch = "Catch",
    Assert = "Assert",
    Break = "Break",
    Continue = "Continue",
    LBrace = "LBrace",
    RBrace = "RBrace",
    LParen = "LParen",
    RParen = "RParen",
    LBracket = "LBracket",
    RBracket = "RBracket",
    Colon = "Colon",
    Semicolon = "Semicolon",
    Comma = "Comma",
    Ellipsis = "Ellipsis",
    Dot = "Dot",
    Hash = "Hash",
    Greater = "Greater",
    Less = "Less",
    Plus = "Plus",
    PlusPlus = "PlusPlus",
    Minus = "Minus",
    MinusMinus = "MinusMinus",
    Tilde = "Tilde",
    Star = "Star",
    Slash = "Slash",
    Percent = "Percent",
    Equals = "Equals",
    Arrow = "Arrow",
    DoubleEquals = "DoubleEquals",
    TripleEquals = "TripleEquals",
    NotEquals = "NotEquals",
    StrictNotEquals = "StrictNotEquals",
    LessEqual = "LessEqual",
    GreaterEqual = "GreaterEqual",
    And = "And",
    Or = "Or",
    Pipe = "Pipe",
    NullishCoalesce = "NullishCoalesce",
    OptionalChain = "OptionalChain",
    Bang = "Bang",
    Ampersand = "Ampersand",
    At = "At",
    Dollar = "Dollar",
    Question = "Question"
}
interface Position {
    index: number;
    line: number;
    column: number;
}
interface Token {
    type: TokenType;
    value: string;
    raw?: string;
    start: Position;
    end: Position;
}

declare class Lexer {
    private input;
    private index;
    private line;
    private column;
    private pendingTokens;
    private templateMode;
    private templateExpressionMode;
    private templateBraceDepth;
    constructor(input: string);
    tokenize(): Token[];
    private readWhitespace;
    private readLineComment;
    private readBlockComment;
    private readIdentifier;
    private readNumber;
    private readString;
    private readTemplateChunk;
    private readPunctuator;
    private trackTemplateBrace;
    private token;
    private position;
    private peek;
    private next;
    private eof;
    private isWhitespace;
    private isAlpha;
    private isDigit;
    private isAlphaNumeric;
}

type Disposer = () => void;
declare function isAbortError(error: unknown): boolean;
declare function throwIfAborted(signal?: AbortSignal | null): void;
/**
 * Owns resources for one mounted element or behavior binding.
 *
 * Disposers run once, in reverse registration order. Registering after the
 * lifetime has been disposed runs the disposer immediately, which makes it
 * safe for asynchronous setup to finish after an element has been removed.
 */
declare class Lifetime {
    private entries;
    private disposed;
    private disposing;
    private readonly controller;
    get isDisposed(): boolean;
    get signal(): AbortSignal;
    /** True while registered cleanup callbacks are being invoked. */
    get isDisposing(): boolean;
    add(disposer: Disposer): Disposer;
    onCleanup(disposer: Disposer): Disposer;
    child(): Lifetime;
    dispose(): void;
}

interface ExecutionContext {
    scope: {
        getPath(key: string): any;
        setPath?(key: string, value: any): void;
        hasKey?(key: string): boolean;
        createChild?(): ExecutionContext["scope"];
    } | undefined;
    rootScope: ExecutionContext["scope"];
    globals?: Record<string, any>;
    engine?: {
        getScope?(element: Element): ExecutionContext["scope"];
        setHtml?(element: Element, value: unknown, options?: {
            trusted?: boolean;
        }): void;
        withExecutionContext?<T>(element: Element | undefined, lifetime: Lifetime | undefined, fn: () => T, scope?: ExecutionContext["scope"]): T;
        batch?<T>(fn: () => T): T;
    };
    element?: Element;
    self?: any;
    lifetime?: Lifetime;
    signal?: AbortSignal;
    returnValue?: any;
    returning?: boolean;
    breaking?: boolean;
    continuing?: boolean;
}
interface CFSNode {
    type: string;
    /**
     * @deprecated CFS evaluation has no preparation phase; this hook is retained
     * for compatibility and is not invoked by the runtime.
     */
    prepare(context: ExecutionContext): Promise<void>;
    evaluate(context: ExecutionContext): any;
}
declare abstract class BaseNode implements CFSNode {
    type: string;
    constructor(type: string);
    prepare(_context: ExecutionContext): Promise<void>;
    evaluate(_context: ExecutionContext): any;
}
declare class ProgramNode extends BaseNode {
    behaviors: BehaviorNode[];
    uses: UseNode[];
    constructor(behaviors: BehaviorNode[], uses?: UseNode[]);
}
interface UseFlags {
    wait?: boolean;
}
interface UseFlagArgs {
    wait?: {
        timeoutMs?: number;
        intervalMs?: number;
    };
}
declare class UseNode extends BaseNode {
    name: string;
    alias: string;
    flags: UseFlags;
    flagArgs: UseFlagArgs;
    constructor(name: string, alias: string, flags?: UseFlags, flagArgs?: UseFlagArgs);
}
declare class BlockNode extends BaseNode {
    statements: CFSNode[];
    constructor(statements: CFSNode[]);
    evaluate(context: ExecutionContext): any;
}
declare class SelectorNode extends BaseNode {
    selectorText: string;
    constructor(selectorText: string);
}
declare class BehaviorNode extends BaseNode {
    selector: SelectorNode;
    body: BlockNode;
    flags: BehaviorFlags;
    flagArgs: BehaviorFlagArgs;
    constructor(selector: SelectorNode, body: BlockNode, flags?: BehaviorFlags, flagArgs?: BehaviorFlagArgs);
}
declare class OnBlockNode extends BaseNode {
    eventName: string;
    args: string[];
    body: BlockNode;
    flags: DeclarationFlags;
    flagArgs: DeclarationFlagArgs;
    constructor(eventName: string, args: string[], body: BlockNode, flags?: DeclarationFlags, flagArgs?: DeclarationFlagArgs);
}
declare class AssignmentNode extends BaseNode {
    target: AssignmentTarget;
    value: ExpressionNode;
    operator: "=" | "+=" | "-=" | "*=" | "/=" | "~=" | "++" | "--";
    prefix: boolean;
    constructor(target: AssignmentTarget, value: ExpressionNode, operator?: "=" | "+=" | "-=" | "*=" | "/=" | "~=" | "++" | "--", prefix?: boolean);
    evaluate(context: ExecutionContext): any;
    private applyCompoundAssignment;
    private applyIncrement;
    private resolveAssignmentTarget;
    private resolveIndexPath;
    private resolveTargetPath;
    private assignTarget;
    private assignDirectiveTarget;
}
declare class ReturnNode extends BaseNode {
    value?: ExpressionNode | undefined;
    constructor(value?: ExpressionNode | undefined);
    evaluate(context: ExecutionContext): any;
}
declare class BreakNode extends BaseNode {
    constructor();
    evaluate(context: ExecutionContext): any;
}
declare class ContinueNode extends BaseNode {
    constructor();
    evaluate(context: ExecutionContext): any;
}
declare class AssertError extends Error {
    constructor(message?: string);
}
declare class AssertNode extends BaseNode {
    test: ExpressionNode;
    constructor(test: ExpressionNode);
    evaluate(context: ExecutionContext): any;
}
declare class IfNode extends BaseNode {
    test: ExpressionNode;
    consequent: BlockNode;
    alternate?: BlockNode | undefined;
    constructor(test: ExpressionNode, consequent: BlockNode, alternate?: BlockNode | undefined);
    evaluate(context: ExecutionContext): any;
}
declare class WhileNode extends BaseNode {
    test: ExpressionNode;
    body: BlockNode;
    constructor(test: ExpressionNode, body: BlockNode);
    evaluate(context: ExecutionContext): any;
}
declare class ForEachNode extends BaseNode {
    target: IdentifierExpression;
    iterable: ExpressionNode;
    kind: "in" | "of";
    body: BlockNode;
    constructor(target: IdentifierExpression, iterable: ExpressionNode, kind: "in" | "of", body: BlockNode);
    evaluate(context: ExecutionContext): any;
    private getEntries;
}
declare class ForNode extends BaseNode {
    init: CFSNode | undefined;
    test: ExpressionNode | undefined;
    update: CFSNode | undefined;
    body: BlockNode;
    constructor(init: CFSNode | undefined, test: ExpressionNode | undefined, update: CFSNode | undefined, body: BlockNode);
    evaluate(context: ExecutionContext): any;
}
declare class TryNode extends BaseNode {
    body: BlockNode;
    errorName: string;
    handler: BlockNode;
    constructor(body: BlockNode, errorName: string, handler: BlockNode);
    evaluate(context: ExecutionContext): any;
}
declare class FunctionDeclarationNode extends BaseNode {
    name: string;
    params: FunctionParam[];
    body: BlockNode;
    isAsync: boolean;
    constructor(name: string, params: FunctionParam[], body: BlockNode, isAsync?: boolean);
}
declare class FunctionExpression extends BaseNode {
    params: FunctionParam[];
    body: BlockNode;
    isAsync: boolean;
    constructor(params: FunctionParam[], body: BlockNode, isAsync?: boolean);
    evaluate(context: ExecutionContext): any;
    private applyParams;
    private restoreParams;
}
interface DeclarationFlags {
    important?: boolean;
    debounce?: boolean;
    [key: string]: boolean | undefined;
}
interface DeclarationFlagArgs {
    debounce?: number;
    [key: string]: any;
}
interface BehaviorFlags {
    [key: string]: boolean | undefined;
}
interface BehaviorFlagArgs {
    [key: string]: any;
}
declare class DeclarationNode extends BaseNode {
    target: DeclarationTarget;
    operator: ":" | ":=" | ":<" | ":>";
    value: ExpressionNode;
    flags: DeclarationFlags;
    flagArgs: DeclarationFlagArgs;
    constructor(target: DeclarationTarget, operator: ":" | ":=" | ":<" | ":>", value: ExpressionNode, flags: DeclarationFlags, flagArgs: DeclarationFlagArgs);
}
type ExpressionNode = AssignmentNode | IdentifierExpression | ElementRefExpression | LiteralExpression | TemplateExpression | TaggedTemplateExpression | UnaryExpression | BinaryExpression | MemberExpression | CallExpression | ArrayExpression | ObjectExpression | IndexExpression | FunctionExpression | AwaitExpression | TernaryExpression | DirectiveExpression | ElementDirectiveExpression | ElementPropertyExpression | QueryExpression;
type DeclarationTarget = IdentifierExpression | DirectiveExpression;
type AssignmentTarget = IdentifierExpression | MemberExpression | IndexExpression | DirectiveExpression | ElementDirectiveExpression | ElementPropertyExpression | ArrayPattern | ObjectPattern;
type FunctionParam = {
    name: string;
    defaultValue?: ExpressionNode;
    rest?: boolean;
};
type PatternNode = IdentifierExpression | ArrayPattern | ObjectPattern;
declare class IdentifierExpression extends BaseNode {
    name: string;
    constructor(name: string);
    evaluate(context: ExecutionContext): any;
}
declare class ElementRefExpression extends BaseNode {
    id: string;
    constructor(id: string);
    evaluate(context: ExecutionContext): any;
}
declare class SpreadElement extends BaseNode {
    value: ExpressionNode;
    constructor(value: ExpressionNode);
}
declare class RestElement extends BaseNode {
    target: IdentifierExpression;
    constructor(target: IdentifierExpression);
}
type ArrayPatternElement = PatternNode | RestElement | null;
declare class ArrayPattern extends BaseNode {
    elements: ArrayPatternElement[];
    constructor(elements: ArrayPatternElement[]);
}
type ObjectPatternEntry = {
    key: string;
    target: PatternNode;
} | {
    rest: IdentifierExpression;
};
declare class ObjectPattern extends BaseNode {
    entries: ObjectPatternEntry[];
    constructor(entries: ObjectPatternEntry[]);
}
declare class LiteralExpression extends BaseNode {
    value: string | number | boolean | null;
    constructor(value: string | number | boolean | null);
    evaluate(): any;
}
declare class TemplateExpression extends BaseNode {
    parts: ExpressionNode[];
    constructor(parts: ExpressionNode[]);
    evaluate(context: ExecutionContext): any;
    getTemplateParts(context: ExecutionContext): {
        strings: string[];
        values: any[];
    };
}
declare class TaggedTemplateExpression extends BaseNode {
    tag: ExpressionNode;
    template: TemplateExpression;
    constructor(tag: ExpressionNode, template: TemplateExpression);
    evaluate(context: ExecutionContext): any;
}
declare class UnaryExpression extends BaseNode {
    operator: string;
    argument: ExpressionNode;
    constructor(operator: string, argument: ExpressionNode);
    evaluate(context: ExecutionContext): any;
}
declare class BinaryExpression extends BaseNode {
    operator: string;
    left: ExpressionNode;
    right: ExpressionNode;
    constructor(operator: string, left: ExpressionNode, right: ExpressionNode);
    evaluate(context: ExecutionContext): any;
}
declare class TernaryExpression extends BaseNode {
    test: ExpressionNode;
    consequent: ExpressionNode;
    alternate: ExpressionNode;
    constructor(test: ExpressionNode, consequent: ExpressionNode, alternate: ExpressionNode);
    evaluate(context: ExecutionContext): any;
}
declare class MemberExpression extends BaseNode {
    target: ExpressionNode;
    property: string;
    optional: boolean;
    constructor(target: ExpressionNode, property: string, optional?: boolean);
    evaluate(context: ExecutionContext): any;
    resolve(context: ExecutionContext): {
        value: any;
        target?: any;
        optional?: boolean;
    } | undefined | Promise<{
        value: any;
        target?: any;
        optional?: boolean;
    } | undefined>;
    getIdentifierPath(): {
        path: string;
        root: string;
    } | undefined;
    private getTargetIdentifierPath;
    private resolveFromScope;
    private resolveFromGlobals;
    private getTargetPath;
}
declare class CallExpression extends BaseNode {
    callee: ExpressionNode;
    args: ExpressionNode[];
    constructor(callee: ExpressionNode, args: ExpressionNode[]);
    evaluate(context: ExecutionContext): any;
    private resolveCallee;
}
type ArrayElement = ExpressionNode | SpreadElement;
declare class ArrayExpression extends BaseNode {
    elements: ArrayElement[];
    constructor(elements: ArrayElement[]);
    evaluate(context: ExecutionContext): any;
}
type ObjectEntry = {
    key: string;
    value: ExpressionNode;
    computed?: false;
} | {
    keyExpr: ExpressionNode;
    value: ExpressionNode;
    computed: true;
} | {
    spread: ExpressionNode;
};
declare class ObjectExpression extends BaseNode {
    entries: ObjectEntry[];
    constructor(entries: ObjectEntry[]);
    evaluate(context: ExecutionContext): any;
}
declare class IndexExpression extends BaseNode {
    target: ExpressionNode;
    index: ExpressionNode;
    constructor(target: ExpressionNode, index: ExpressionNode);
    evaluate(context: ExecutionContext): any;
    private normalizeIndexKey;
}
declare class DirectiveExpression extends BaseNode {
    kind: "attr" | "style";
    name: string;
    constructor(kind: "attr" | "style", name: string);
    evaluate(context: ExecutionContext): any;
}
declare class ElementDirectiveExpression extends BaseNode {
    element: ExpressionNode;
    directive: DirectiveExpression;
    constructor(element: ExpressionNode, directive: DirectiveExpression);
    evaluate(context: ExecutionContext): any;
}
declare class ElementPropertyExpression extends BaseNode {
    element: ExpressionNode;
    property: string;
    constructor(element: ExpressionNode, property: string);
    evaluate(context: ExecutionContext): any;
}
declare class AwaitExpression extends BaseNode {
    argument: ExpressionNode;
    constructor(argument: ExpressionNode);
    evaluate(context: ExecutionContext): any;
}
declare class QueryExpression extends BaseNode {
    direction: "self" | "descendant" | "ancestor";
    selector: string;
    constructor(direction: "self" | "descendant" | "ancestor", selector: string);
    evaluate(context: ExecutionContext): any;
}

declare class Parser {
    private stream;
    private source;
    private customFlags;
    private behaviorFlags;
    private allowImplicitSemicolon;
    private awaitStack;
    private functionDepth;
    constructor(input: string, options?: {
        customFlags?: Set<string>;
        behaviorFlags?: Set<string>;
    });
    static parseInline(code: string): BlockNode;
    parseProgram(): ProgramNode;
    parseInlineBlock(): BlockNode;
    private parseBehavior;
    private parseSelector;
    private parseBehaviorFlags;
    private parseUseStatement;
    private parseUseFlags;
    private wrapErrors;
    private formatError;
    private getLineSnippet;
    private parseBlock;
    private parseStatement;
    private parseOnBlock;
    private parseOnFlags;
    private parseAssignment;
    private parseExpression;
    private parsePipeExpression;
    private buildPipeCall;
    private parseTernaryExpression;
    private parseNullishExpression;
    private parseLogicalOrExpression;
    private parseLogicalAndExpression;
    private parseEqualityExpression;
    private parseComparisonExpression;
    private parseMultiplicativeExpression;
    private parseAdditiveExpression;
    private parseUnaryExpression;
    private parsePostfixExpression;
    private createIncrementNode;
    private parseCallExpression;
    private parsePrimaryExpression;
    private parseDirectiveExpression;
    private parseElementRefExpression;
    private parseArrayExpression;
    private parseTemplateExpression;
    private parseObjectExpression;
    private consumeStatementTerminator;
    private parseFunctionBlockWithAwait;
    private isAsyncToken;
    private isAwaitAllowed;
    private parseArrowExpressionBody;
    private parseAssignmentTarget;
    private parseArrayPattern;
    private parseObjectPattern;
    private parseDeclaration;
    private parseDeclarationTarget;
    private parseDeclarationOperator;
    private parseFlags;
    private parseCustomFlagArg;
    private parseCustomFlagLiteral;
    private parseCustomFlagArray;
    private parseCustomFlagObject;
    private isDeclarationStart;
    private isAssignmentStart;
    private isAssignmentOperatorStart;
    private isExpressionStatementStart;
    private isImplicitBehaviorStart;
    private isSelectorStartToken;
    private isFunctionDeclarationStart;
    private isArrowFunctionStart;
    private isAsyncArrowFunctionStart;
    private isFunctionExpressionAssignmentStart;
    private parseExpressionStatement;
    private parseIfBlock;
    private parseConditionalBody;
    private parseWhileBlock;
    private parseForBlock;
    private detectForEachKind;
    private parseForEachTarget;
    private parseForClause;
    private parseAssignmentExpression;
    private parseAssignmentOperator;
    private parseTryBlock;
    private parseConstructBlock;
    private parseDestructBlock;
    private parseQueryExpression;
    private parseFunctionDeclaration;
    private parseReturnStatement;
    private parseAssertStatement;
    private parseBreakStatement;
    private parseContinueStatement;
    private parseArrowFunctionExpression;
    private parseFunctionParams;
    private readSelectorUntil;
    private parseIdentifierPath;
}

type Listener = () => void;
type ReactiveOptions = {
    lifetime?: Lifetime;
};
type ReactiveScheduler = (run: () => void) => Disposer | void;
type EffectOptions = ReactiveOptions & {
    scheduler?: ReactiveScheduler;
};
type ComputedGetter<T> = (scope: Scope) => T;
type EffectCallback = (scope: Scope) => void | Disposer;
interface ComputedRef<T> {
    readonly value: T;
    get(): T;
    subscribe(listener: Listener): Disposer;
    dispose(): void;
}
/**
 * Coalesces scope notifications until the synchronous callback completes.
 * Async callbacks are not held open across an await; wrap each synchronous
 * update phase separately when needed.
 */
declare function batch<T>(callback: () => T): T;
declare class Scope {
    parent?: Scope | undefined;
    private data;
    private computedValues;
    private root;
    private listeners;
    private dependencyListeners;
    private anyListeners;
    private reactiveProxies;
    isEachItem: boolean;
    constructor(parent?: Scope | undefined);
    createChild(): Scope;
    setParent(parent: Scope): void;
    get(key: string): any;
    set(key: string, value: any): void;
    batch<T>(callback: () => T): T;
    computed<T>(getter: ComputedGetter<T>, options?: ReactiveOptions): ComputedRef<T>;
    computed<T>(name: string, getter: ComputedGetter<T>, options?: ReactiveOptions): ComputedRef<T>;
    effect(callback: EffectCallback, options?: EffectOptions): Disposer;
    hasKey(path: string): boolean;
    /** Returns whether a path is defined on this scope or one of its parents. */
    hasPath(path: string): boolean;
    getPath(path: string): any;
    setPath(path: string, value: any): void;
    on(path: string, handler: () => void): void;
    off(path: string, handler: () => void): void;
    /** @internal Subscribe to an exact read and to replacements of its parents. */
    onDependency(path: string, handler: () => void): void;
    /** @internal Remove an exact dependency subscription. */
    offDependency(path: string, handler: () => void): void;
    onAny(handler: () => void): void;
    offAny(handler: () => void): void;
    private emitChange;
    private resolveScope;
    private getLocalPathValue;
    private findNearestScopeWithKey;
    private wrapValue;
    private appendPath;
}
declare function computed<T>(scope: Scope, getter: ComputedGetter<T>, options?: ReactiveOptions): ComputedRef<T>;
declare function effect(scope: Scope, callback: EffectCallback, options?: EffectOptions): Disposer;

type RequestSwap = "inner" | "outer" | "none";
type RequestHistory = "none" | "push" | "replace";
type RequestStatePaths = {
    loading?: string;
    error?: string;
    data?: string;
};
interface RequestConfig {
    url?: string;
    method?: string;
    headers?: HeadersInit;
    body?: unknown;
    form?: HTMLFormElement;
    submitter?: HTMLElement;
    targetSelector?: string;
    swap?: RequestSwap;
    trusted?: boolean;
    history?: RequestHistory;
    historyUrl?: string;
    restoreFocus?: boolean | string;
    signal?: AbortSignal;
}
/** Backwards-compatible name for integrations that used the old GET helper. */
type GetConfig = RequestConfig;
interface RequestResult {
    response: Response;
    body: string;
    target: Element | null;
    swapped: boolean;
}
declare class RequestError extends Error {
    readonly response: Response;
    readonly status: number;
    readonly statusText: string;
    readonly url: string;
    constructor(response: Response);
}

type HtmlSanitizer = (html: string) => string;
type HtmlSanitizerOptions = {
    dompurifyConfig?: Record<string, any>;
    sanitizer?: HtmlSanitizer;
};

interface RegisteredBehavior {
    id: number;
    hash: string;
    selector: string;
    rootSelector: string;
    parentSelector?: string;
    specificity: number;
    order: number;
    construct?: BlockNode;
    destruct?: BlockNode;
    onBlocks: {
        event: string;
        body: BlockNode;
        flags: DeclarationFlags;
        flagArgs: DeclarationFlagArgs;
        args: string[];
    }[];
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
type AttributeHandler = {
    id: string;
    match: (name: string) => boolean;
    handle: (element: Element, name: string, value: string, scope: Scope, context?: AttributeHandlerContext) => boolean | void;
};
type AttributeHandlerContext = {
    lifetime: Lifetime;
    signal: AbortSignal;
    hydrating: boolean;
    onCleanup: (disposer: Disposer) => Disposer;
};
type HtmlTransformContext = {
    element: HTMLElement;
    trusted: boolean;
};
type HtmlTransformer = (value: unknown, context: HtmlTransformContext) => unknown;
type HtmlTransformOptions = {
    priority?: number;
};
type HtmlSetOptions = {
    trusted?: boolean;
    process?: boolean;
};
type FlagApplyContext = {
    name: string;
    args: any;
    element: Element;
    scope: Scope;
    declaration: DeclarationNode;
    lifetime: Lifetime;
    signal: AbortSignal;
    onCleanup: (disposer: Disposer) => Disposer;
};
type FlagHandler = {
    onApply?: (context: FlagApplyContext) => void;
    transformValue?: (context: FlagApplyContext, value: any) => any;
    onEventBind?: (context: EventFlagContext) => EventBindPatch | void;
    onEventBefore?: (context: EventFlagContext) => boolean | void;
    onEventAfter?: (context: EventFlagContext) => void;
    transformEventArgs?: (context: EventFlagContext, args: any[]) => any[];
};
type BehaviorModifierHandler = {
    onBind?: (context: BehaviorModifierContext) => void | Promise<void>;
    onConstruct?: (context: BehaviorModifierContext) => void | Promise<void>;
    onDestruct?: (context: BehaviorModifierContext) => void | Promise<void>;
    onUnbind?: (context: BehaviorModifierContext) => void | Promise<void>;
};
type BehaviorModifierContext = {
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
type EventBindPatch = {
    listenerTarget?: EventTarget;
    options?: AddEventListenerOptions;
    debounceMs?: number;
};
type EventFlagContext = {
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
type EngineOptions = {
    diagnostics?: boolean;
    logger?: Partial<Pick<Console, "info" | "warn">>;
    htmlSanitizer?: HtmlSanitizer;
    trustedTypesPolicy?: TrustedTypesPolicy;
    trustedTypesPolicyName?: string;
};
type HydrationOptions = {
    state?: Record<string, any>;
};
type TrustedTypesPolicy = {
    createHTML: (value: string) => unknown;
};
declare class Engine {
    private static activeEngines;
    private scopes;
    private bindBindings;
    private ifBindings;
    private showBindings;
    private htmlBindings;
    private getBindings;
    private eachBindings;
    private lifecycleBindings;
    private behaviorRegistry;
    private behaviorRegistryHashes;
    private behaviorEntriesById;
    private dynamicBehaviorIds;
    private behaviorBoundElements;
    private behaviorBindings;
    private behaviorRootScopes;
    private behaviorLifetimes;
    private inlineLifetimes;
    private behaviorId;
    private codeCache;
    private behaviorCache;
    private observer;
    private observerLifetime;
    private attributeHandlers;
    private htmlTransformers;
    private htmlTransformerOrder;
    private htmlSanitizer;
    private trustedTypesPolicy;
    private trustedTypesPolicyName;
    private trustedTypesPolicyResolved;
    private globals;
    private importantFlags;
    private inlineDeclarations;
    private flagHandlers;
    private behaviorModifiers;
    private pendingAdded;
    private pendingRemoved;
    private pendingUpdated;
    private observerFlush;
    private ignoredAdded;
    private ignoredRemoved;
    private diagnostics;
    private logger;
    private engineLifetime;
    private pendingUses;
    private pendingAutoBindToScope;
    private executionStack;
    private groupProxyCache;
    private scopeElements;
    private classMapBindings;
    private dynamicOwnerCleanupLifetimes;
    private mountedRoots;
    private mountedDocuments;
    private inactiveSubtrees;
    private hydratingElements;
    constructor(options?: EngineOptions);
    private matchesMinWidth;
    private matchesMaxWidth;
    private parseWidthArg;
    private mediaMatches;
    private getGroupTargetScope;
    private getGroupProxy;
    mount(root: HTMLElement): Promise<void>;
    /**
     * Attaches VSN to server-rendered markup while preserving DOM values that
     * do not have client state yet.
     */
    hydrate(root: HTMLElement, options?: HydrationOptions): Promise<void>;
    private initializeRoot;
    unmount(element: Element): void;
    registerBehaviors(source: string): void;
    private registerBehaviorSource;
    registerGlobal(name: string, value: any): void;
    registerGlobals(values: Record<string, any>): void;
    registerFlag(name: string, handler?: FlagHandler): void;
    registerBehaviorModifier(name: string, handler?: BehaviorModifierHandler): void;
    registerHtmlTransformer(transform: HtmlTransformer, options?: HtmlTransformOptions): () => void;
    registerHtmlSanitizer(sanitizer: HtmlSanitizer): () => void;
    getRegistryStats(): {
        behaviorCount: number;
        behaviorCacheSize: number;
    };
    registerAttributeHandler(handler: AttributeHandler): void;
    private resolveGlobalPath;
    private waitForUses;
    private waitForUseGlobal;
    getScope(element: Element, parentScope?: Scope): Scope;
    /**
     * Returns the lifetime owned by an element's inline bindings.
     * Extensions can use this for resources that should live until the element
     * is unmounted.
     */
    getLifetime(element: Element): Lifetime;
    get signal(): AbortSignal;
    batch<T>(callback: () => T): T;
    computed<T>(scope: Scope, getter: ComputedGetter<T>, options?: ReactiveOptions): ComputedRef<T>;
    effect(scope: Scope, callback: EffectCallback, options?: EffectOptions): Disposer;
    dispose(): void;
    private getInlineLifetime;
    private resetInlineLifetime;
    private getBehaviorLifetime;
    private disposeLifetime;
    private disposeBehaviorLifetimes;
    private addEventListener;
    private cleanupBehaviorBindings;
    setHtml(element: Element, value: unknown, options?: HtmlSetOptions): void;
    /**
     * Sends a request and optionally applies its HTML response through the
    * engine's sanitizer and behavior processor.
    */
    request(element: Element, config: RequestConfig): Promise<RequestResult>;
    private toTrustedHtml;
    private isNativeTrustedHtml;
    private getTrustedTypesPolicy;
    processHtml(root: Element, options?: {
        trusted?: boolean;
    }): void;
    evaluate(element: Element): void;
    private attachObserver;
    private observeRoot;
    private reconnectObserver;
    private disposeMountedRoots;
    private disconnectObserver;
    private flushObserverQueue;
    private handleRemovedNode;
    private getIfBindingsInBoundary;
    private findParentIfBinding;
    private disposeIfBinding;
    private disposeIfBindingsInBoundary;
    private getIfTransitionName;
    private parseCssTimes;
    private getIfTransitionDuration;
    private scheduleIfTransitionFrame;
    private cancelIfTransition;
    private startIfTransition;
    private runIfHook;
    private beginIfEnter;
    private beginIfLeave;
    private ensureIfMarker;
    private suspendIfDescendants;
    private resumeIfDescendants;
    private deactivateIf;
    private finishDeactivateIf;
    private activateIf;
    private updateIfBinding;
    private attachIfBinding;
    private teardownElement;
    private handleAddedNode;
    private handleUpdatedNode;
    private applyBehaviors;
    private isInactive;
    private isHydrating;
    private reapplyBehaviorsForElement;
    private applyBehaviorForElement;
    private unbindBehaviorForElement;
    private runBehaviorDestruct;
    private attachAttributes;
    private setLifecycle;
    private runConstruct;
    private runDestruct;
    private parseEachExpression;
    private createEachScope;
    private updateEachScope;
    private createEachItem;
    private removeEachItem;
    private mountEachItem;
    private placeEachItem;
    private reportEachKeyError;
    private renderUnkeyedEach;
    private renderKeyedEach;
    private renderEach;
    private attachBindInputHandler;
    private parseBindDirection;
    private resolveBindConfig;
    private isFormControl;
    private hasScopeValue;
    private hasElementValue;
    private coerceInt;
    private coerceFloat;
    private isInEachScope;
    private flushAutoBindQueue;
    private hasVsnAttributes;
    private markInlineDeclaration;
    private isInlineDeclaration;
    private findParentScope;
    private watch;
    private watchWithDebounce;
    private watchExpression;
    private trackScopeWatcher;
    private trackBehaviorClassMapBinding;
    private trackBehaviorInvalidator;
    private parseOnAttribute;
    private parseInlineFlags;
    private parseInlineFlagArg;
    private describeElement;
    private logDiagnostic;
    private emitError;
    private emitUseError;
    private attachOnHandler;
    private attachBehaviorOnHandler;
    private attachGetHandler;
    private resolveRequestForm;
    private resolveRequestSubmitter;
    private resolveRequestValue;
    private resolveRequestHeaders;
    private getEventBindingConfig;
    private applyEventFlagBefore;
    private applyEventFlagAfter;
    private applyEventFlagArgTransforms;
    private matchesKeyFlag;
    private withExecutionFrame;
    withExecutionContext<T>(element: Element | undefined, lifetime: Lifetime | undefined, fn: () => T, scope?: Scope): T;
    private withExecutionElement;
    getCurrentElement(): Element | undefined;
    getCurrentLifetime(): Lifetime | undefined;
    getCurrentScope(): Scope | undefined;
    private execute;
    private executeBlock;
    private safeExecute;
    private safeExecuteBlock;
    private collectBehavior;
    private collectNestedBehaviors;
    private trackDynamicBehavior;
    private disposeDynamicBehaviors;
    private computeSpecificity;
    private computeSpecificityForElement;
    private getBehaviorRootScope;
    private getImportantKey;
    private isImportant;
    private markImportant;
    private extractLifecycle;
    private extractOnBlocks;
    private extractDeclarations;
    private extractFunctionDeclarations;
    private getCachedBehavior;
    private hashBehavior;
    private normalizeNode;
    private hashString;
    private applyBehaviorFunctions;
    private applyBehaviorFunction;
    private applyFunctionParams;
    private restoreFunctionParams;
    private applyBehaviorDeclarations;
    private applyBehaviorDeclaration;
    private applyCustomFlags;
    private applyCustomFlagTransforms;
    private applyBehaviorModifierHook;
    private behaviorHasModifierHooks;
    private applyDirectiveFromScope;
    private applyDirectiveFromExpression;
    private applyDirectiveToScope;
    private applyCheckedBindingToScope;
    private applyValueBindingToScope;
    private setDirectiveValue;
    private isClassMapValue;
    private applyClassMap;
    private clearClassMapBinding;
    private getDirectiveValue;
    private handleHtmlBehaviors;
    private registerDefaultAttributeHandlers;
}

declare const VERSION: string;

declare function parseCFS(source: string): ProgramNode;
declare function autoMount(root?: HTMLElement | Document): Engine | null;

export { type ArrayElement, ArrayExpression, ArrayPattern, type ArrayPatternElement, AssertError, AssertNode, AssignmentNode, type AssignmentTarget, type AttributeHandler, type AttributeHandlerContext, AwaitExpression, BaseNode, type BehaviorFlagArgs, type BehaviorFlags, type BehaviorModifierContext, type BehaviorModifierHandler, BehaviorNode, BinaryExpression, BlockNode, BreakNode, type CFSNode, CallExpression, type ComputedGetter, type ComputedRef, ContinueNode, type DeclarationFlagArgs, type DeclarationFlags, DeclarationNode, type DeclarationTarget, DirectiveExpression, type Disposer, type EffectCallback, type EffectOptions, ElementDirectiveExpression, ElementPropertyExpression, ElementRefExpression, Engine, type EngineOptions, type EventBindPatch, type EventFlagContext, type ExecutionContext, type ExpressionNode, type FlagApplyContext, type FlagHandler, ForEachNode, ForNode, FunctionDeclarationNode, FunctionExpression, type FunctionParam, type GetConfig, type HtmlSanitizer, type HtmlSanitizerOptions, type HtmlSetOptions, type HtmlTransformContext, type HtmlTransformOptions, type HtmlTransformer, type HydrationOptions, IdentifierExpression, IfNode, IndexExpression, Lexer, Lifetime, LiteralExpression, MemberExpression, type ObjectEntry, ObjectExpression, ObjectPattern, type ObjectPatternEntry, OnBlockNode, Parser, type PatternNode, ProgramNode, QueryExpression, type ReactiveOptions, type ReactiveScheduler, type RegisteredBehavior, type RequestConfig, RequestError, type RequestHistory, type RequestResult, type RequestStatePaths, type RequestSwap, RestElement, ReturnNode, Scope, SelectorNode, SpreadElement, TaggedTemplateExpression, TemplateExpression, TernaryExpression, TokenType, type TrustedTypesPolicy, TryNode, UnaryExpression, type UseFlagArgs, type UseFlags, UseNode, VERSION, WhileNode, autoMount, batch, computed, effect, isAbortError, parseCFS, throwIfAborted };
