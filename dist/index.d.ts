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
    target: string;
    value: ExpressionNode;
    constructor(target: string, value: ExpressionNode);
}
type ExpressionNode = IdentifierExpression | LiteralExpression | UnaryExpression | DirectiveExpression | QueryExpression;
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
    private parseQueryExpression;
    private readSelectorUntil;
}

declare const VERSION = "0.1.0";

declare function parseCFS(source: string): ProgramNode;

export { AssignmentNode, BaseNode, BehaviorNode, BlockNode, type CFSNode, DirectiveExpression, type ExecutionContext, type ExpressionNode, IdentifierExpression, Lexer, LiteralExpression, OnBlockNode, Parser, ProgramNode, QueryExpression, SelectorNode, StateBlockNode, StateEntryNode, TokenType, UnaryExpression, VERSION, parseCFS };
