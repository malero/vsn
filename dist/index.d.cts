declare enum TokenType {
    Whitespace = "Whitespace",
    Identifier = "Identifier",
    Number = "Number",
    String = "String",
    Boolean = "Boolean",
    Null = "Null",
    Behavior = "Behavior",
    State = "State",
    On = "On",
    Construct = "Construct",
    Destruct = "Destruct",
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
    constructor(behaviors: BehaviorNode[]);
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
    constructor(eventName: string, args: string[], body: BlockNode);
}
declare class AssignmentNode extends BaseNode {
    target: AssignmentTarget;
    value: ExpressionNode;
    constructor(target: AssignmentTarget, value: ExpressionNode);
    evaluate(context: ExecutionContext): Promise<any>;
}
interface DeclarationFlags {
    important?: boolean;
    trusted?: boolean;
    debounce?: boolean;
}
interface DeclarationFlagArgs {
    debounce?: number;
}
declare class DeclarationNode extends BaseNode {
    target: DeclarationTarget;
    operator: ":" | ":=" | ":<" | ":>";
    value: ExpressionNode;
    flags: DeclarationFlags;
    flagArgs: DeclarationFlagArgs;
    constructor(target: DeclarationTarget, operator: ":" | ":=" | ":<" | ":>", value: ExpressionNode, flags: DeclarationFlags, flagArgs: DeclarationFlagArgs);
}
type ExpressionNode = IdentifierExpression | LiteralExpression | UnaryExpression | BinaryExpression | CallExpression | DirectiveExpression | QueryExpression;
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
declare class CallExpression extends BaseNode {
    callee: ExpressionNode;
    args: ExpressionNode[];
    constructor(callee: ExpressionNode, args: ExpressionNode[]);
    evaluate(context: ExecutionContext): Promise<any>;
    private resolveCallee;
}
declare class DirectiveExpression extends BaseNode {
    kind: "attr" | "style";
    name: string;
    constructor(kind: "attr" | "style", name: string);
    evaluate(): Promise<any>;
}
declare class QueryExpression extends BaseNode {
    direction: "self" | "descendant" | "ancestor";
    selector: string;
    constructor(direction: "self" | "descendant" | "ancestor", selector: string);
}

declare class Parser {
    private stream;
    constructor(input: string);
    static parseInline(code: string): BlockNode;
    parseProgram(): ProgramNode;
    parseInlineBlock(): BlockNode;
    private parseBehavior;
    private parseSelector;
    private parseBlock;
    private parseStatement;
    private parseStateBlock;
    private parseOnBlock;
    private parseAssignment;
    private parseExpression;
    private parseAdditiveExpression;
    private parseUnaryExpression;
    private parseCallExpression;
    private parsePrimaryExpression;
    private parseAssignmentTarget;
    private parseDeclaration;
    private parseDeclarationTarget;
    private parseDeclarationOperator;
    private parseFlags;
    private isDeclarationStart;
    private isAssignmentStart;
    private isCallStart;
    private parseExpressionStatement;
    private parseConstructBlock;
    private parseDestructBlock;
    private parseQueryExpression;
    private readSelectorUntil;
    private parseIdentifierPath;
}

declare class Scope {
    readonly parent?: Scope | undefined;
    private data;
    private root;
    private listeners;
    constructor(parent?: Scope | undefined);
    get(key: string): any;
    set(key: string, value: any): void;
    getPath(path: string): any;
    setPath(path: string, value: any): void;
    on(path: string, handler: () => void): void;
    off(path: string, handler: () => void): void;
    private emitChange;
    private resolveScope;
}

type AttributeHandler = {
    id: string;
    match: (name: string) => boolean;
    handle: (element: Element, name: string, value: string, scope: Scope) => boolean | void;
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
    private observer?;
    private attributeHandlers;
    private globals;
    constructor();
    mount(root: HTMLElement): Promise<void>;
    unmount(element: Element): void;
    registerBehaviors(source: string): void;
    registerGlobal(name: string, value: any): void;
    registerGlobals(values: Record<string, any>): void;
    registerAttributeHandler(handler: AttributeHandler): void;
    getScope(element: Element, parentScope?: Scope): Scope;
    evaluate(element: Element): void;
    private attachObserver;
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
    private findParentScope;
    private watch;
    private watchWithDebounce;
    private parseOnAttribute;
    private attachOnHandler;
    private attachBehaviorOnHandler;
    private attachGetHandler;
    private execute;
    private executeBlock;
    private collectBehavior;
    private extractLifecycle;
    private extractOnBlocks;
    private extractDeclarations;
    private applyBehaviorDeclarations;
    private applyBehaviorDeclaration;
    private applyDirectiveFromScope;
    private applyDirectiveToScope;
    private applyValueBindingToScope;
    private setDirectiveValue;
    private getDirectiveValue;
    private registerDefaultAttributeHandlers;
}

declare const VERSION = "0.1.0";

declare function parseCFS(source: string): ProgramNode;
declare function autoMount(root?: HTMLElement | Document): Engine | null;

export { AssignmentNode, type AssignmentTarget, BaseNode, BehaviorNode, BinaryExpression, BlockNode, type CFSNode, CallExpression, type DeclarationFlagArgs, type DeclarationFlags, DeclarationNode, type DeclarationTarget, DirectiveExpression, Engine, type ExecutionContext, type ExpressionNode, IdentifierExpression, Lexer, LiteralExpression, OnBlockNode, Parser, ProgramNode, QueryExpression, SelectorNode, StateBlockNode, StateEntryNode, TokenType, UnaryExpression, VERSION, autoMount, parseCFS };
