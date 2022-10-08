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
    FOR = 12,
    IF = 13,
    ELSE_IF = 14,
    ELSE = 15,
    FUNC = 16,
    ON = 17,
    CLASS = 18,
    NAME = 19,
    L_BRACE = 20,
    R_BRACE = 21,
    L_BRACKET = 22,
    R_BRACKET = 23,
    L_PAREN = 24,
    R_PAREN = 25,
    TILDE = 26,
    PERIOD = 27,
    COMMA = 28,
    COLON = 29,
    SEMICOLON = 30,
    STRING_FORMAT = 31,
    STRING_LITERAL = 32,
    NUMBER_LITERAL = 33,
    BOOLEAN_LITERAL = 34,
    NULL_LITERAL = 35,
    STRICT_EQUALS = 36,
    STRICT_NOT_EQUALS = 37,
    EQUALS = 38,
    NOT_EQUALS = 39,
    GREATER_THAN_EQUAL = 40,
    LESS_THAN_EQUAL = 41,
    GREATER_THAN = 42,
    LESS_THAN = 43,
    ASSIGN = 44,
    AND = 45,
    OR = 46,
    ADD = 47,
    SUBTRACT = 48,
    MULTIPLY = 49,
    DIVIDE = 50,
    ADD_ASSIGN = 51,
    SUBTRACT_ASSIGN = 52,
    MULTIPLY_ASSIGN = 53,
    DIVIDE_ASSIGN = 54,
    EXCLAMATION_POINT = 55,
    ELEMENT_REFERENCE = 56,
    ELEMENT_ATTRIBUTE = 57,
    ELEMENT_STYLE = 58,
    ELEMENT_QUERY = 59,
    UNIT = 60,
    XHR_GET = 61,
    XHR_POST = 62,
    XHR_PUT = 63,
    XHR_DELETE = 64,
    MODIFIER = 65,
    DISPATCH_EVENT = 66
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
