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
    NAME = 15,
    L_BRACE = 16,
    R_BRACE = 17,
    L_BRACKET = 18,
    R_BRACKET = 19,
    L_PAREN = 20,
    R_PAREN = 21,
    TILDE = 22,
    PERIOD = 23,
    COMMA = 24,
    COLON = 25,
    SEMICOLON = 26,
    STRING_FORMAT = 27,
    STRING_LITERAL = 28,
    NUMBER_LITERAL = 29,
    BOOLEAN_LITERAL = 30,
    NULL_LITERAL = 31,
    STRICT_EQUALS = 32,
    STRICT_NOT_EQUALS = 33,
    EQUALS = 34,
    NOT_EQUALS = 35,
    GREATER_THAN_EQUAL = 36,
    LESS_THAN_EQUAL = 37,
    GREATER_THAN = 38,
    LESS_THAN = 39,
    ASSIGN = 40,
    AND = 41,
    OR = 42,
    ADD = 43,
    SUBTRACT = 44,
    MULTIPLY = 45,
    DIVIDE = 46,
    ADD_ASSIGN = 47,
    SUBTRACT_ASSIGN = 48,
    MULTIPLY_ASSIGN = 49,
    DIVIDE_ASSIGN = 50,
    EXCLAMATION_POINT = 51,
    ELEMENT_REFERENCE = 52,
    ELEMENT_ATTRIBUTE = 53,
    ELEMENT_STYLE = 54,
    ELEMENT_QUERY = 55,
    UNIT = 56,
    XHR_GET = 57,
    XHR_POST = 58,
    XHR_PUT = 59,
    XHR_DELETE = 60
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
