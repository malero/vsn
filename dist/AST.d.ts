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
    NAME = 14,
    L_BRACE = 15,
    R_BRACE = 16,
    L_BRACKET = 17,
    R_BRACKET = 18,
    L_PAREN = 19,
    R_PAREN = 20,
    TILDE = 21,
    PERIOD = 22,
    COMMA = 23,
    COLON = 24,
    SEMICOLON = 25,
    STRING_FORMAT = 26,
    STRING_LITERAL = 27,
    NUMBER_LITERAL = 28,
    BOOLEAN_LITERAL = 29,
    NULL_LITERAL = 30,
    STRICT_EQUALS = 31,
    STRICT_NOT_EQUALS = 32,
    EQUALS = 33,
    NOT_EQUALS = 34,
    GREATER_THAN_EQUAL = 35,
    LESS_THAN_EQUAL = 36,
    GREATER_THAN = 37,
    LESS_THAN = 38,
    ASSIGN = 39,
    AND = 40,
    OR = 41,
    ADD = 42,
    SUBTRACT = 43,
    MULTIPLY = 44,
    DIVIDE = 45,
    ADD_ASSIGN = 46,
    SUBTRACT_ASSIGN = 47,
    MULTIPLY_ASSIGN = 48,
    DIVIDE_ASSIGN = 49,
    EXCLAMATION_POINT = 50,
    ELEMENT_REFERENCE = 51,
    ELEMENT_ATTRIBUTE = 52,
    ELEMENT_STYLE = 53,
    ELEMENT_QUERY = 54,
    UNIT = 55,
    XHR_GET = 56,
    XHR_POST = 57,
    XHR_PUT = 58,
    XHR_DELETE = 59
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
