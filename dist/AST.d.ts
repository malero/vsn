import { Scope } from "./Scope";
export interface Token {
    type: TokenType;
    value: string;
}
export declare enum BlockType {
    BRACE = 0,
    BRACKET = 1,
    PAREN = 2
}
export declare enum TokenType {
    WHITESPACE = 0,
    RETURN = 1,
    OF = 2,
    FOR = 3,
    IF = 4,
    ELSE_IF = 5,
    ELSE = 6,
    NAME = 7,
    L_BRACE = 8,
    R_BRACE = 9,
    L_BRACKET = 10,
    R_BRACKET = 11,
    L_PAREN = 12,
    R_PAREN = 13,
    PERIOD = 14,
    COMMA = 15,
    COLON = 16,
    SEMI_COLON = 17,
    STRING_LITERAL = 18,
    NUMBER_LITERAL = 19,
    BOOLEAN_LITERAL = 20,
    NULL_LITERAL = 21,
    STRICT_EQUALS = 22,
    STRICT_NOT_EQUALS = 23,
    EQUALS = 24,
    NOT_EQUALS = 25,
    GREATER_THAN = 26,
    LESS_THAN = 27,
    GREATER_THAN_EQUAL = 28,
    LESS_THAN_EQUAL = 29,
    ASSIGN = 30,
    AND = 31,
    OR = 32,
    ADD = 33,
    SUBTRACT = 34,
    MULTIPLY = 35,
    DIVIDE = 36,
    ADD_ASSIGN = 37,
    SUBTRACT_ASSIGN = 38,
    MULTIPLY_ASSIGN = 39,
    DIVIDE_ASSIGN = 40,
    EXCLAMATION_POINT = 41,
    ELEMENT_ID = 42,
    ELEMENT_ATTRIBUTE = 43
}
export declare function tokenize(code: string): Token[];
export interface TreeNode<T = any> {
    evaluate(scope: Scope): any;
}
export declare abstract class Node implements TreeNode {
    abstract evaluate(scope: Scope): any;
    getChildNodes(): Node[];
    findChildrenByType<T = Node>(t: any): T[];
    findChildrenByTypes<T = Node>(types: any[]): T[];
}
export declare class BlockNode extends Node implements TreeNode {
    readonly statements: Node[];
    constructor(statements: Node[]);
    getChildNodes(): Node[];
    evaluate(scope: any): Promise<any>;
}
export declare class Tree {
    readonly code: string;
    protected rootNode: Node;
    constructor(code: string);
    parse(): void;
    evaluate(scope: Scope): Promise<any>;
    bindToScopeChanges(scope: any, fnc: any): Promise<void>;
    static stripWhiteSpace(tokens: Token[]): Token[];
    static processTokens(tokens: Token[]): BlockNode;
    static toCode(tokens: Token[], limit?: any): string;
    static getNextStatmentTokens(tokens: Token[], consumeSemicolon?: boolean): Token[];
    static getBlockTokens(tokens: Token[], blockType?: BlockType, groupByComma?: boolean): Token[][];
    static consumeTypes(tokens: Token[], types: TokenType[]): Token[];
}
