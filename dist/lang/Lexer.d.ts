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
    COLON = 9,
    SEMI_COLON = 10,
    STRING_LITERAL = 11,
    NUMBER_LITERAL = 12,
    BOOLEAN_LITERAL = 13,
    NULL_LITERAL = 14
}
export declare function tokenize(code: string): Token[];
