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
    ON = 15,
    CLASS = 16,
    NAME = 17,
    L_BRACE = 18,
    R_BRACE = 19,
    L_BRACKET = 20,
    R_BRACKET = 21,
    L_PAREN = 22,
    R_PAREN = 23,
    TILDE = 24,
    PERIOD = 25,
    COMMA = 26,
    COLON = 27,
    SEMICOLON = 28,
    STRING_FORMAT = 29,
    STRING_LITERAL = 30,
    NUMBER_LITERAL = 31,
    BOOLEAN_LITERAL = 32,
    NULL_LITERAL = 33,
    STRICT_EQUALS = 34,
    STRICT_NOT_EQUALS = 35,
    EQUALS = 36,
    NOT_EQUALS = 37,
    GREATER_THAN_EQUAL = 38,
    LESS_THAN_EQUAL = 39,
    GREATER_THAN = 40,
    LESS_THAN = 41,
    ASSIGN = 42,
    AND = 43,
    OR = 44,
    ADD = 45,
    SUBTRACT = 46,
    MULTIPLY = 47,
    DIVIDE = 48,
    ADD_ASSIGN = 49,
    SUBTRACT_ASSIGN = 50,
    MULTIPLY_ASSIGN = 51,
    DIVIDE_ASSIGN = 52,
    EXCLAMATION_POINT = 53,
    ELEMENT_REFERENCE = 54,
    ELEMENT_ATTRIBUTE = 55,
    ELEMENT_STYLE = 56,
    ELEMENT_QUERY = 57,
    UNIT = 58,
    XHR_GET = 59,
    XHR_POST = 60,
    XHR_PUT = 61,
    XHR_DELETE = 62
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
    static processTokens(tokens: Token[]): BlockNode;
    static toCode(tokens: Token[], limit?: any): string;
    static getBlockInfo(tokens: Token[]): IBlockInfo;
    static getNextStatementTokens(tokens: Token[], consumeClosingToken?: boolean, consumeOpeningToken?: boolean, includeClosingToken?: boolean): Token[];
    static getBlockTokens(tokens: Token[], groupBy?: TokenType | null): Token[][];
    static getTokensUntil(tokens: Token[], terminator?: TokenType, consumeTerminator?: boolean, includeTerminator?: boolean, validIfTerminatorNotFound?: boolean, blockInfo?: IBlockInfo): Token[];
    static consumeTypes(tokens: Token[], types: TokenType[]): Token[];
    static apply(code: string, scope: Scope, dom: DOM, tag: Tag): Promise<any>;
}
