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
    TYPE_BOOL = 6,
    RETURN = 7,
    NOT = 8,
    OF = 9,
    AS = 10,
    IN = 11,
    WITH = 12,
    NAMED_STACK = 13,
    FOR = 14,
    IF = 15,
    ELSE_IF = 16,
    ELSE = 17,
    FUNC = 18,
    LOOP = 19,
    ON = 20,
    CLASS = 21,
    NAME = 22,
    L_BRACE = 23,
    R_BRACE = 24,
    L_BRACKET = 25,
    R_BRACKET = 26,
    L_PAREN = 27,
    R_PAREN = 28,
    TILDE = 29,
    PERIOD = 30,
    COMMA = 31,
    COLON = 32,
    SEMICOLON = 33,
    STRING_FORMAT = 34,
    STRING_LITERAL = 35,
    NUMBER_LITERAL = 36,
    BOOLEAN_LITERAL = 37,
    NULL_LITERAL = 38,
    STRICT_EQUALS = 39,
    STRICT_NOT_EQUALS = 40,
    EQUALS = 41,
    NOT_EQUALS = 42,
    GREATER_THAN_EQUAL = 43,
    LESS_THAN_EQUAL = 44,
    GREATER_THAN = 45,
    LESS_THAN = 46,
    ASSIGN = 47,
    AND = 48,
    OR = 49,
    ADD = 50,
    SUBTRACT = 51,
    MULTIPLY = 52,
    DIVIDE = 53,
    ADD_ASSIGN = 54,
    SUBTRACT_ASSIGN = 55,
    MULTIPLY_ASSIGN = 56,
    DIVIDE_ASSIGN = 57,
    EXCLAMATION_POINT = 58,
    ELEMENT_REFERENCE = 59,
    ELEMENT_ATTRIBUTE = 60,
    ELEMENT_STYLE = 61,
    ELEMENT_QUERY = 62,
    UNIT = 63,
    XHR_GET = 64,
    XHR_POST = 65,
    XHR_PUT = 66,
    XHR_DELETE = 67,
    MODIFIER = 68,
    DISPATCH_EVENT = 69
}
export interface BlockTypeConfiguration {
    open: number;
    close: number;
}
export declare const BlockTypeConfigurations: {
    [key: number]: BlockTypeConfiguration;
};
export declare const BlockOpenToTypeMap: {
    23: BlockType;
    25: BlockType;
    27: BlockType;
};
export declare const BlockCloseToTypeMap: {
    24: BlockType;
    26: BlockType;
    28: BlockType;
};
export declare function getTokenBlockOpenerConfig(opener: TokenType): BlockTypeConfiguration;
export declare function tokenIsBlockOpener(token: TokenType): boolean;
export declare function tokenIsBlockCloser(token: TokenType): boolean;
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
export interface ExecutionContext {
    scope: Scope;
    dom: DOM;
    tag: Tag;
    tree: Tree;
}
export declare class TreeCache {
    cache: Map<string, Node>;
    lastUsed: Map<string, number>;
    get(code: string): Node;
    set(code: string, node: Node): void;
    has(code: string): boolean;
}
export declare class Tree {
    readonly code: string;
    protected static executing: Set<ExecutionContext>;
    protected static cache: TreeCache;
    protected _root: Node;
    constructor(code: string);
    get root(): Node;
    parse(): void;
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    bindToScopeChanges(scope: any, fnc: any, dom: DOM, tag?: Tag): Promise<void>;
    static reprepareExecutingTrees(): void;
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
