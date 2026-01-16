declare enum TokenType {
    Whitespace = "Whitespace",
    Identifier = "Identifier",
    Number = "Number",
    String = "String",
    Boolean = "Boolean",
    Null = "Null",
    Behavior = "Behavior",
    Use = "Use",
    State = "State",
    On = "On",
    Construct = "Construct",
    Destruct = "Destruct",
    Return = "Return",
    LBrace = "LBrace",
    RBrace = "RBrace",
    LParen = "LParen",
    RParen = "RParen",
    LBracket = "LBracket",
    RBracket = "RBracket",
    Colon = "Colon",
    Semicolon = "Semicolon",
    Comma = "Comma",
    Dot = "Dot",
    Hash = "Hash",
    Greater = "Greater",
    Less = "Less",
    Plus = "Plus",
    Minus = "Minus",
    Tilde = "Tilde",
    Star = "Star",
    Equals = "Equals",
    Arrow = "Arrow",
    DoubleEquals = "DoubleEquals",
    NotEquals = "NotEquals",
    LessEqual = "LessEqual",
    GreaterEqual = "GreaterEqual",
    And = "And",
    Or = "Or",
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
    constructor(input: string);
    tokenize(): Token[];
    private readWhitespace;
    private readLineComment;
    private readBlockComment;
    private readIdentifier;
    private readNumber;
    private readString;
    private readPunctuator;
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
    scope?: {
        getPath(key: string): any;
        setPath?(key: string, value: any): void;
    };
    globals?: Record<string, any>;
    element?: Element;
    returnValue?: any;
    returning?: boolean;
}
interface CFSNode {
    type: string;
    prepare(context: ExecutionContext): Promise<void>;
    evaluate(context: ExecutionContext): Promise<any>;
}
declare abstract class BaseNode implements CFSNode {
    type: string;
    constructor(type: string);
    prepare(_context: ExecutionContext): Promise<void>;
    evaluate(_context: ExecutionContext): Promise<any>;
}
declare class ProgramNode extends BaseNode {
    behaviors: BehaviorNode[];
    uses: UseNode[];
    constructor(behaviors: BehaviorNode[], uses?: UseNode[]);
}
declare class UseNode extends BaseNode {
    name: string;
    alias: string;
    constructor(name: string, alias: string);
}
declare class BlockNode extends BaseNode {
    statements: CFSNode[];
    constructor(statements: CFSNode[]);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class SelectorNode extends BaseNode {
    selectorText: string;
    constructor(selectorText: string);
}
declare class BehaviorNode extends BaseNode {
    selector: SelectorNode;
    body: BlockNode;
    constructor(selector: SelectorNode, body: BlockNode);
}
declare class StateEntryNode extends BaseNode {
    name: string;
    value: ExpressionNode;
    important: boolean;
    constructor(name: string, value: ExpressionNode, important: boolean);
}
declare class StateBlockNode extends BaseNode {
    entries: StateEntryNode[];
    constructor(entries: StateEntryNode[]);
}
declare class OnBlockNode extends BaseNode {
    eventName: string;
    args: string[];
    body: BlockNode;
    modifiers: string[];
    constructor(eventName: string, args: string[], body: BlockNode, modifiers?: string[]);
}
declare class AssignmentNode extends BaseNode {
    target: AssignmentTarget;
    value: ExpressionNode;
    constructor(target: AssignmentTarget, value: ExpressionNode);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class ReturnNode extends BaseNode {
    value?: ExpressionNode | undefined;
    constructor(value?: ExpressionNode | undefined);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class FunctionDeclarationNode extends BaseNode {
    name: string;
    params: string[];
    body: BlockNode;
    constructor(name: string, params: string[], body: BlockNode);
}
declare class FunctionExpression extends BaseNode {
    params: string[];
    body: BlockNode;
    constructor(params: string[], body: BlockNode);
    evaluate(context: ExecutionContext): Promise<any>;
}
interface DeclarationFlags {
    important?: boolean;
    trusted?: boolean;
    debounce?: boolean;
    [key: string]: boolean | undefined;
}
interface DeclarationFlagArgs {
    debounce?: number;
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
type ExpressionNode = IdentifierExpression | LiteralExpression | UnaryExpression | BinaryExpression | CallExpression | ArrayExpression | IndexExpression | FunctionExpression | TernaryExpression | DirectiveExpression | QueryExpression;
type DeclarationTarget = IdentifierExpression | DirectiveExpression;
type AssignmentTarget = IdentifierExpression | DirectiveExpression;
declare class IdentifierExpression extends BaseNode {
    name: string;
    constructor(name: string);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class LiteralExpression extends BaseNode {
    value: string | number | boolean | null;
    constructor(value: string | number | boolean | null);
    evaluate(): Promise<any>;
}
declare class UnaryExpression extends BaseNode {
    operator: string;
    argument: ExpressionNode;
    constructor(operator: string, argument: ExpressionNode);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class BinaryExpression extends BaseNode {
    operator: string;
    left: ExpressionNode;
    right: ExpressionNode;
    constructor(operator: string, left: ExpressionNode, right: ExpressionNode);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class TernaryExpression extends BaseNode {
    test: ExpressionNode;
    consequent: ExpressionNode;
    alternate: ExpressionNode;
    constructor(test: ExpressionNode, consequent: ExpressionNode, alternate: ExpressionNode);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class CallExpression extends BaseNode {
    callee: ExpressionNode;
    args: ExpressionNode[];
    constructor(callee: ExpressionNode, args: ExpressionNode[]);
    evaluate(context: ExecutionContext): Promise<any>;
    private resolveCallee;
}
declare class ArrayExpression extends BaseNode {
    elements: ExpressionNode[];
    constructor(elements: ExpressionNode[]);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class IndexExpression extends BaseNode {
    target: ExpressionNode;
    index: ExpressionNode;
    constructor(target: ExpressionNode, index: ExpressionNode);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class DirectiveExpression extends BaseNode {
    kind: "attr" | "style";
    name: string;
    constructor(kind: "attr" | "style", name: string);
    evaluate(context: ExecutionContext): Promise<any>;
}
declare class QueryExpression extends BaseNode {
    direction: "self" | "descendant" | "ancestor";
    selector: string;
    constructor(direction: "self" | "descendant" | "ancestor", selector: string);
    evaluate(context: ExecutionContext): Promise<any>;
}

declare class Parser {
    private stream;
    private source;
    private customFlags;
    private allowImplicitSemicolon;
    constructor(input: string, options?: {
        customFlags?: Set<string>;
    });
    static parseInline(code: string): BlockNode;
    parseProgram(): ProgramNode;
    parseInlineBlock(): BlockNode;
    private parseBehavior;
    private parseSelector;
    private parseUseStatement;
    private wrapErrors;
    private formatError;
    private getLineSnippet;
    private parseBlock;
    private parseStatement;
    private parseStateBlock;
    private parseOnBlock;
    private parseOnModifiers;
    private parseAssignment;
    private parseExpression;
    private parseTernaryExpression;
    private parseLogicalOrExpression;
    private parseLogicalAndExpression;
    private parseEqualityExpression;
    private parseComparisonExpression;
    private parseAdditiveExpression;
    private parseUnaryExpression;
    private parseCallExpression;
    private parsePrimaryExpression;
    private parseArrayExpression;
    private consumeStatementTerminator;
    private parseAssignmentTarget;
    private parseDeclaration;
    private parseDeclarationTarget;
    private parseDeclarationOperator;
    private parseFlags;
    private parseCustomFlagArg;
    private isDeclarationStart;
    private isAssignmentStart;
    private isCallStart;
    private isFunctionDeclarationStart;
    private isArrowFunctionStart;
    private isFunctionExpressionAssignmentStart;
    private parseExpressionStatement;
    private parseConstructBlock;
    private parseDestructBlock;
    private parseQueryExpression;
    private parseFunctionDeclaration;
    private parseFunctionBlock;
    private parseReturnStatement;
    private parseArrowFunctionExpression;
    private readSelectorUntil;
    private parseIdentifierPath;
}

declare class Scope {
    readonly parent?: Scope | undefined;
    private data;
    private root;
    private listeners;
    private anyListeners;
    constructor(parent?: Scope | undefined);
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
};
declare class Engine {
    private scopes;
    private bindBindings;
    private ifBindings;
    private showBindings;
    private htmlBindings;
    private getBindings;
    private lifecycleBindings;
    private behaviorRegistry;
    private behaviorBindings;
    private behaviorId;
    private codeCache;
    private behaviorCache;
    private observer?;
    private attributeHandlers;
    private globals;
    private importantFlags;
    private inlineDeclarations;
    private flagHandlers;
    private pendingAdded;
    private pendingRemoved;
    private observerFlush?;
    constructor();
    mount(root: HTMLElement): Promise<void>;
    unmount(element: Element): void;
    registerBehaviors(source: string): void;
    registerGlobal(name: string, value: any): void;
    registerGlobals(values: Record<string, any>): void;
    registerFlag(name: string, handler?: FlagHandler): void;
    getRegistryStats(): {
        behaviorCount: number;
        behaviorCacheSize: number;
    };
    registerAttributeHandler(handler: AttributeHandler): void;
    private resolveGlobalPath;
    getScope(element: Element, parentScope?: Scope): Scope;
    evaluate(element: Element): void;
    private attachObserver;
    private flushObserverQueue;
    private handleRemovedNode;
    private handleAddedNode;
    private applyBehaviors;
    private runBehaviorDestruct;
    private attachAttributes;
    private setLifecycle;
    private runConstruct;
    private runDestruct;
    private attachBindInputHandler;
    private parseBindDirection;
    private hasVsnAttributes;
    private markInlineDeclaration;
    private isInlineDeclaration;
    private findParentScope;
    private watch;
    private watchWithDebounce;
    private watchAllScopes;
    private parseOnAttribute;
    private attachOnHandler;
    private attachBehaviorOnHandler;
    private attachGetHandler;
    private applyEventModifiers;
    private getListenerOptions;
    private execute;
    private executeBlock;
    private collectBehavior;
    private computeSpecificity;
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
    private applyBehaviorDeclarations;
    private applyBehaviorDeclaration;
    private applyCustomFlags;
    private applyDirectiveFromScope;
    private applyDirectiveFromExpression;
    private applyDirectiveToScope;
    private applyCheckedBindingToScope;
    private applyValueBindingToScope;
    private setDirectiveValue;
    private getDirectiveValue;
    private handleTrustedHtml;
    private registerDefaultAttributeHandlers;
}

declare const VERSION = "0.1.0";

declare function parseCFS(source: string): ProgramNode;
declare function autoMount(root?: HTMLElement | Document): Engine | null;

export { ArrayExpression, AssignmentNode, type AssignmentTarget, BaseNode, BehaviorNode, BinaryExpression, BlockNode, type CFSNode, CallExpression, type DeclarationFlagArgs, type DeclarationFlags, DeclarationNode, type DeclarationTarget, DirectiveExpression, Engine, type ExecutionContext, type ExpressionNode, FunctionDeclarationNode, FunctionExpression, IdentifierExpression, IndexExpression, Lexer, LiteralExpression, OnBlockNode, Parser, ProgramNode, QueryExpression, ReturnNode, SelectorNode, StateBlockNode, StateEntryNode, TernaryExpression, TokenType, UnaryExpression, UseNode, VERSION, autoMount, parseCFS };
