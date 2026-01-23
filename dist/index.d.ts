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

interface ExecutionContext {
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
interface CFSNode {
    type: string;
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
type ExpressionNode = AssignmentNode | IdentifierExpression | ElementRefExpression | LiteralExpression | TemplateExpression | UnaryExpression | BinaryExpression | MemberExpression | CallExpression | ArrayExpression | ObjectExpression | IndexExpression | FunctionExpression | AwaitExpression | TernaryExpression | DirectiveExpression | ElementDirectiveExpression | ElementPropertyExpression | QueryExpression;
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

declare class Scope {
    parent?: Scope | undefined;
    private data;
    private root;
    private listeners;
    private anyListeners;
    isEachItem: boolean;
    constructor(parent?: Scope | undefined);
    createChild(): Scope;
    setParent(parent: Scope): void;
    get(key: string): any;
    set(key: string, value: any): void;
    hasKey(path: string): boolean;
    getPath(path: string): any;
    setPath(path: string, value: any): void;
    on(path: string, handler: () => void): void;
    off(path: string, handler: () => void): void;
    onAny(handler: () => void): void;
    offAny(handler: () => void): void;
    private emitChange;
    private resolveScope;
    private getLocalPathValue;
    private findNearestScopeWithKey;
}

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
type FlagApplyContext = {
    name: string;
    args: any;
    element: Element;
    scope: Scope;
    declaration: DeclarationNode;
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
};
type EngineOptions = {
    diagnostics?: boolean;
    logger?: Partial<Pick<Console, "info" | "warn">>;
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
    private behaviorBindings;
    private behaviorListeners;
    private behaviorId;
    private codeCache;
    private behaviorCache;
    private observer;
    private attributeHandlers;
    private globals;
    private importantFlags;
    private inlineDeclarations;
    private flagHandlers;
    private behaviorModifiers;
    private pendingAdded;
    private pendingRemoved;
    private pendingUpdated;
    private observerFlush?;
    private ignoredAdded;
    private diagnostics;
    private logger;
    private pendingUses;
    private pendingAutoBindToScope;
    private scopeWatchers;
    private executionStack;
    private groupProxyCache;
    private scopeElements;
    constructor(options?: EngineOptions);
    private getGroupTargetScope;
    private getGroupProxy;
    mount(root: HTMLElement): Promise<void>;
    unmount(element: Element): void;
    registerBehaviors(source: string): void;
    registerGlobal(name: string, value: any): void;
    registerGlobals(values: Record<string, any>): void;
    registerFlag(name: string, handler?: FlagHandler): void;
    registerBehaviorModifier(name: string, handler?: BehaviorModifierHandler): void;
    getRegistryStats(): {
        behaviorCount: number;
        behaviorCacheSize: number;
    };
    registerAttributeHandler(handler: AttributeHandler): void;
    private resolveGlobalPath;
    private waitForUses;
    private waitForUseGlobal;
    getScope(element: Element, parentScope?: Scope): Scope;
    evaluate(element: Element): void;
    private attachObserver;
    private disconnectObserver;
    private flushObserverQueue;
    private handleRemovedNode;
    private handleAddedNode;
    private handleUpdatedNode;
    private applyBehaviors;
    private reapplyBehaviorsForElement;
    private applyBehaviorForElement;
    private unbindBehaviorForElement;
    private runBehaviorDestruct;
    private attachAttributes;
    private setLifecycle;
    private runConstruct;
    private runDestruct;
    private parseEachExpression;
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
    private watchAllScopes;
    private trackScopeWatcher;
    private cleanupScopeWatchers;
    private cleanupBehaviorListeners;
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
    private getEventBindingConfig;
    private applyEventFlagBefore;
    private applyEventFlagAfter;
    private applyEventFlagArgTransforms;
    private matchesKeyFlag;
    private withExecutionElement;
    getCurrentElement(): Element | undefined;
    private execute;
    private executeBlock;
    private safeExecute;
    private safeExecuteBlock;
    private collectBehavior;
    private collectNestedBehaviors;
    private computeSpecificity;
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
    private getDirectiveValue;
    private handleHtmlBehaviors;
    private registerDefaultAttributeHandlers;
}

declare const VERSION: string;

declare function parseCFS(source: string): ProgramNode;
declare function autoMount(root?: HTMLElement | Document): Engine | null;

export { type ArrayElement, ArrayExpression, ArrayPattern, type ArrayPatternElement, AssertError, AssertNode, AssignmentNode, type AssignmentTarget, AwaitExpression, BaseNode, type BehaviorFlagArgs, type BehaviorFlags, BehaviorNode, BinaryExpression, BlockNode, BreakNode, type CFSNode, CallExpression, ContinueNode, type DeclarationFlagArgs, type DeclarationFlags, DeclarationNode, type DeclarationTarget, DirectiveExpression, ElementDirectiveExpression, ElementPropertyExpression, ElementRefExpression, Engine, type ExecutionContext, type ExpressionNode, ForEachNode, ForNode, FunctionDeclarationNode, FunctionExpression, type FunctionParam, IdentifierExpression, IfNode, IndexExpression, Lexer, LiteralExpression, MemberExpression, type ObjectEntry, ObjectExpression, ObjectPattern, type ObjectPatternEntry, OnBlockNode, Parser, type PatternNode, ProgramNode, QueryExpression, RestElement, ReturnNode, SelectorNode, SpreadElement, TemplateExpression, TernaryExpression, TokenType, TryNode, UnaryExpression, type UseFlagArgs, type UseFlags, UseNode, VERSION, WhileNode, autoMount, parseCFS };
