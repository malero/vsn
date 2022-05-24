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
    IN = 9,
    FOR = 10,
    IF = 11,
    ELSE_IF = 12,
    ELSE = 13,
    FUNC = 14,
    CLASS = 15,
    NAME = 16,
    L_BRACE = 17,
    R_BRACE = 18,
    L_BRACKET = 19,
    R_BRACKET = 20,
    L_PAREN = 21,
    R_PAREN = 22,
    TILDE = 23,
    PERIOD = 24,
    COMMA = 25,
    COLON = 26,
    SEMICOLON = 27,
    STRING_FORMAT = 28,
    STRING_LITERAL = 29,
    NUMBER_LITERAL = 30,
    BOOLEAN_LITERAL = 31,
    NULL_LITERAL = 32,
    STRICT_EQUALS = 33,
    STRICT_NOT_EQUALS = 34,
    EQUALS = 35,
    NOT_EQUALS = 36,
    GREATER_THAN_EQUAL = 37,
    LESS_THAN_EQUAL = 38,
    GREATER_THAN = 39,
    LESS_THAN = 40,
    ASSIGN = 41,
    AND = 42,
    OR = 43,
    ADD = 44,
    SUBTRACT = 45,
    MULTIPLY = 46,
    DIVIDE = 47,
    ADD_ASSIGN = 48,
    SUBTRACT_ASSIGN = 49,
    MULTIPLY_ASSIGN = 50,
    DIVIDE_ASSIGN = 51,
    EXCLAMATION_POINT = 52,
    ELEMENT_REFERENCE = 53,
    ELEMENT_ATTRIBUTE = 54,
    ELEMENT_STYLE = 55,
    ELEMENT_QUERY = 56,
    UNIT = 57,
    XHR_GET = 58,
    XHR_POST = 59,
    XHR_PUT = 60,
    XHR_DELETE = 61
}
export interface TreeNode<T = any> {
    evaluate(scope: Scope, dom: DOM, tag?: Tag): any;
    prepare(scope: Scope, dom: DOM, tag?: Tag): any;
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
    static processTokens(tokens: Token[]): BlockNode;
    static toCode(tokens: Token[], limit?: any): string;
    static getBlockInfo(tokens: Token[]): IBlockInfo;
    static getNextStatementTokens(tokens: Token[], consumeClosingToken?: boolean, consumeOpeningToken?: boolean, includeClosingToken?: boolean): Token[];
    static getBlockTokens(tokens: Token[], groupBy?: TokenType | null): Token[][];
    static getTokensUntil(tokens: Token[], terminator?: TokenType, consumeTerminator?: boolean, includeTerminator?: boolean, validIfTerminatorNotFound?: boolean, blockInfo?: IBlockInfo): Token[];
    static consumeTypes(tokens: Token[], types: TokenType[]): Token[];
    static apply(code: string, scope: Scope, dom: DOM, tag: Tag): Promise<any>;
}
