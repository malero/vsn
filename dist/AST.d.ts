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
}
export declare enum BlockType {
    BRACE = 0,
    BRACKET = 1,
    PAREN = 2,
    STATEMENT = 3
}
export declare enum TokenType {
    WHITESPACE = 0,
    TYPE_INT = 1,
    TYPE_UINT = 2,
    TYPE_FLOAT = 3,
    TYPE_STRING = 4,
    RETURN = 5,
    NOT = 6,
    OF = 7,
    IN = 8,
    FOR = 9,
    IF = 10,
    ELSE_IF = 11,
    ELSE = 12,
    NAME = 13,
    L_BRACE = 14,
    R_BRACE = 15,
    L_BRACKET = 16,
    R_BRACKET = 17,
    L_PAREN = 18,
    R_PAREN = 19,
    TILDE = 20,
    PERIOD = 21,
    COMMA = 22,
    COLON = 23,
    SEMI_COLON = 24,
    STRING_LITERAL = 25,
    NUMBER_LITERAL = 26,
    BOOLEAN_LITERAL = 27,
    NULL_LITERAL = 28,
    STRICT_EQUALS = 29,
    STRICT_NOT_EQUALS = 30,
    EQUALS = 31,
    NOT_EQUALS = 32,
    GREATER_THAN_EQUAL = 33,
    LESS_THAN_EQUAL = 34,
    GREATER_THAN = 35,
    LESS_THAN = 36,
    ASSIGN = 37,
    AND = 38,
    OR = 39,
    ADD = 40,
    SUBTRACT = 41,
    MULTIPLY = 42,
    DIVIDE = 43,
    ADD_ASSIGN = 44,
    SUBTRACT_ASSIGN = 45,
    MULTIPLY_ASSIGN = 46,
    DIVIDE_ASSIGN = 47,
    EXCLAMATION_POINT = 48,
    ELEMENT_REFERENCE = 49,
    ELEMENT_ATTRIBUTE = 50,
    ELEMENT_STYLE = 51,
    ELEMENT_QUERY = 52,
    UNIT = 53
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
    protected rootNode: Node;
    constructor(code: string);
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
}
