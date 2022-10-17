import { Scope } from "./Scope";
import { DOM } from "./DOM";
import { Tag } from "./Tag";
import { RootScopeMemberNode } from "./AST/RootScopeMemberNode";
import { ScopeMemberNode } from "./AST/ScopeMemberNode";
import { ElementAttributeNode } from "./AST/ElementAttributeNode";
import { Node } from "./AST/Node";
import { BlockNode } from "./AST/BlockNode";
export interface Token {
    type: TokenType;
    value: string;
    full: string;
    groups: string[];
}
export declare enum BlockType {
    BRACE = 0,
    BRACKET = 1,
    PAREN = 2,
    STATEMENT = 3
}
export declare enum TokenType {
    NULL = 0,
    WHITESPACE = 1,
    TYPE_INT = 2,
    TYPE_UINT = 3,
    TYPE_FLOAT = 4,
    TYPE_STRING = 5,
    RETURN = 6,
    NOT = 7,
    OF = 8,
    AS = 9,
    IN = 10,
    WITH = 11,
    NAMED_STACK = 12,
    FOR = 13,
    IF = 14,
    ELSE_IF = 15,
    ELSE = 16,
    FUNC = 17,
    ON = 18,
    CLASS = 19,
    NAME = 20,
    L_BRACE = 21,
    R_BRACE = 22,
    L_BRACKET = 23,
    R_BRACKET = 24,
    L_PAREN = 25,
    R_PAREN = 26,
    TILDE = 27,
    PERIOD = 28,
    COMMA = 29,
    COLON = 30,
    SEMICOLON = 31,
    STRING_FORMAT = 32,
    STRING_LITERAL = 33,
    NUMBER_LITERAL = 34,
    BOOLEAN_LITERAL = 35,
    NULL_LITERAL = 36,
    STRICT_EQUALS = 37,
    STRICT_NOT_EQUALS = 38,
    EQUALS = 39,
    NOT_EQUALS = 40,
    GREATER_THAN_EQUAL = 41,
    LESS_THAN_EQUAL = 42,
    GREATER_THAN = 43,
    LESS_THAN = 44,
    ASSIGN = 45,
    AND = 46,
    OR = 47,
    ADD = 48,
    SUBTRACT = 49,
    MULTIPLY = 50,
    DIVIDE = 51,
    ADD_ASSIGN = 52,
    SUBTRACT_ASSIGN = 53,
    MULTIPLY_ASSIGN = 54,
    DIVIDE_ASSIGN = 55,
    EXCLAMATION_POINT = 56,
    ELEMENT_REFERENCE = 57,
    ELEMENT_ATTRIBUTE = 58,
    ELEMENT_STYLE = 59,
    ELEMENT_QUERY = 60,
    UNIT = 61,
    XHR_GET = 62,
    XHR_POST = 63,
    XHR_PUT = 64,
    XHR_DELETE = 65,
    MODIFIER = 66,
    DISPATCH_EVENT = 67
}
export interface TreeNode<T = any> {
    evaluate(scope: Scope, dom: DOM, tag?: Tag): any;
    prepare(scope: Scope, dom: DOM, tag?: Tag, meta?: any): any;
}
export interface IBlockInfo {
    type: BlockType;
    open: TokenType;
    close: TokenType;
    openCharacter: string;
    closeCharacter: string;
}
export declare const AttributableNodes: (typeof RootScopeMemberNode | typeof ScopeMemberNode | typeof ElementAttributeNode)[];
export declare class Tree {
    readonly code: string;
    protected static cache: {
        [key: string]: Node;
    };
    protected _root: Node;
    constructor(code: string);
    get root(): Node;
    parse(): void;
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    bindToScopeChanges(scope: any, fnc: any, dom: DOM, tag?: Tag): Promise<void>;
    static tokenize(code: string): Token[];
    static stripWhiteSpace(tokens: Token[]): Token[];
    static processTokens(tokens: Token[], _node?: Node, _lastBlock?: Node): BlockNode;
    static toCode(tokens: Token[], limit?: any): string;
    static getBlockInfo(tokens: Token[]): IBlockInfo;
    static getNextStatementTokens(tokens: Token[], consumeClosingToken?: boolean, consumeOpeningToken?: boolean, includeClosingToken?: boolean): Token[];
    static getBlockTokens(tokens: Token[], groupBy?: TokenType | null): Token[][];
    static getTokensUntil(tokens: Token[], terminator?: TokenType, consumeTerminator?: boolean, includeTerminator?: boolean, validIfTerminatorNotFound?: boolean, blockInfo?: IBlockInfo): Token[];
    static consumeTypes(tokens: Token[], types: TokenType[]): Token[];
    static apply(code: string, scope: Scope, dom: DOM, tag: Tag): Promise<any>;
}
