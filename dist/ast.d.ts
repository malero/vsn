import { Scope } from "./Scope";
export interface Token {
    type: TokenType;
    value: string;
}
export declare enum TokenType {
    WHITESPACE = 0,
    NAME = 1,
    L_BRACE = 2,
    R_BRACE = 3,
    L_BRACKET = 4,
    R_BRACKET = 5,
    L_PAREN = 6,
    R_PAREN = 7,
    PERIOD = 8,
    COMMA = 9,
    COLON = 10,
    SEMI_COLON = 11,
    STRING_LITERAL = 12,
    NUMBER_LITERAL = 13,
    BOOLEAN_LITERAL = 14,
    NULL_LITERAL = 15
}
export declare function tokenize(code: string): Token[];
interface Node<T = any> {
    evaluate(scope: Scope): T;
}
export declare class Tree {
    readonly code: string;
    protected rootNode: Node;
    constructor(code: string);
    evaluate(scope: Scope): any;
    static processTokens(tokens: Token[]): Node;
    static getFunctionArgumentTokens(tokens: Token[]): Token[][];
}
export {};
