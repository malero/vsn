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
type ExpressionNode = IdentifierExpression | LiteralExpression | UnaryExpression | DirectiveExpression | QueryExpression;
type DeclarationTarget = IdentifierExpression | DirectiveExpression;
type AssignmentTarget = IdentifierExpression | DirectiveExpression;
declare class IdentifierExpression extends BaseNode {
    name: string;
    constructor(name: string);
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
}
declare class DirectiveExpression extends BaseNode {
    kind: "attr" | "style";
    name: string;
    constructor(kind: "attr" | "style", name: string);
}
declare class QueryExpression extends BaseNode {
    direction: "self" | "descendant" | "ancestor";
    selector: string;
    constructor(direction: "self" | "descendant" | "ancestor", selector: string);
}

declare class Parser {
    private stream;
    constructor(input: string);
    parseProgram(): ProgramNode;
    private parseBehavior;
    private parseSelector;
    private parseBlock;
    private parseStatement;
    private parseStateBlock;
    private parseOnBlock;
    private parseAssignment;
    private parseExpression;
    private parseAssignmentTarget;
    private isAssignmentStart;
    private parseIdentifierPath;
    private parseQueryExpression;
    private readSelectorUntil;
    private parseDeclaration;
    private parseDeclarationTarget;
    private parseDeclarationOperator;
    private parseFlags;
    private isDeclarationStart;
    private parseConstructBlock;
    private parseDestructBlock;
}

declare class Scope {
    private data;
    get(key: string): any;
    set(key: string, value: any): void;
    getPath(path: string): any;
    setPath(path: string, value: any): void;
}

declare class Engine {
    private scopes;
    private ifBindings;
    private showBindings;
    private htmlBindings;
    private getBindings;
    mount(root: HTMLElement): Promise<void>;
    getScope(element: Element): Scope;
    evaluate(element: Element): void;
    private attachAttributes;
    private getOnEventName;
    private attachOnHandler;
    private attachGetHandler;
    private execute;
    private evaluateExpression;
}

declare const VERSION = "0.1.0";

declare function parseCFS(source: string): ProgramNode;

export { AssignmentNode, type AssignmentTarget, BaseNode, BehaviorNode, BlockNode, type CFSNode, type DeclarationFlagArgs, type DeclarationFlags, DeclarationNode, type DeclarationTarget, DirectiveExpression, Engine, type ExecutionContext, type ExpressionNode, IdentifierExpression, Lexer, LiteralExpression, OnBlockNode, Parser, ProgramNode, QueryExpression, SelectorNode, StateBlockNode, StateEntryNode, TokenType, UnaryExpression, VERSION, parseCFS };
