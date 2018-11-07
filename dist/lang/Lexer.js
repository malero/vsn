"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenType;
(function (TokenType) {
    TokenType[TokenType["WHITESPACE"] = 0] = "WHITESPACE";
    TokenType[TokenType["NAME"] = 1] = "NAME";
    TokenType[TokenType["L_BRACE"] = 2] = "L_BRACE";
    TokenType[TokenType["R_BRACE"] = 3] = "R_BRACE";
    TokenType[TokenType["L_BRACKET"] = 4] = "L_BRACKET";
    TokenType[TokenType["R_BRACKET"] = 5] = "R_BRACKET";
    TokenType[TokenType["L_PAREN"] = 6] = "L_PAREN";
    TokenType[TokenType["R_PAREN"] = 7] = "R_PAREN";
    TokenType[TokenType["PERIOD"] = 8] = "PERIOD";
    TokenType[TokenType["COLON"] = 9] = "COLON";
    TokenType[TokenType["SEMI_COLON"] = 10] = "SEMI_COLON";
    TokenType[TokenType["STRING_LITERAL"] = 11] = "STRING_LITERAL";
    TokenType[TokenType["NUMBER_LITERAL"] = 12] = "NUMBER_LITERAL";
    TokenType[TokenType["BOOLEAN_LITERAL"] = 13] = "BOOLEAN_LITERAL";
    TokenType[TokenType["NULL_LITERAL"] = 14] = "NULL_LITERAL";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var TOKEN_PATTERNS = [
    {
        type: TokenType.WHITESPACE,
        pattern: /^\s+/
    },
    {
        type: TokenType.NAME,
        pattern: /^[_a-zA-Z][_a-zA-Z0-9]*/
    },
    {
        type: TokenType.L_BRACE,
        pattern: /^{/
    },
    {
        type: TokenType.R_BRACE,
        pattern: /^}/
    },
    {
        type: TokenType.L_BRACKET,
        pattern: /^\[/
    },
    {
        type: TokenType.R_BRACKET,
        pattern: /^]/
    },
    {
        type: TokenType.L_PAREN,
        pattern: /^\(/
    },
    {
        type: TokenType.R_PAREN,
        pattern: /^\)/
    },
    {
        type: TokenType.PERIOD,
        pattern: /^\./
    },
    {
        type: TokenType.COLON,
        pattern: /^:/
    },
    {
        type: TokenType.SEMI_COLON,
        pattern: /^;/
    },
    {
        type: TokenType.STRING_LITERAL,
        pattern: /^"([^"]*)"/
    },
    {
        type: TokenType.STRING_LITERAL,
        pattern: /^'([^']*)'/
    },
    {
        type: TokenType.NUMBER_LITERAL,
        pattern: /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?/i
    },
    {
        type: TokenType.BOOLEAN_LITERAL,
        pattern: /^true|false/
    },
    {
        type: TokenType.NULL_LITERAL,
        pattern: /^null/
    }
];
function tokenize(code) {
    var tokens = [];
    var foundToken;
    do {
        foundToken = false;
        for (var _i = 0, TOKEN_PATTERNS_1 = TOKEN_PATTERNS; _i < TOKEN_PATTERNS_1.length; _i++) {
            var tp = TOKEN_PATTERNS_1[_i];
            var match = tp.pattern.exec(code);
            if (match) {
                console.log(match);
                tokens.push({
                    type: tp.type,
                    value: match[match.length - 1]
                });
                code = code.substring(match[0].length);
                foundToken = true;
                break;
            }
        }
    } while (code.length > 0 && foundToken);
    return tokens;
}
exports.tokenize = tokenize;
//# sourceMappingURL=Lexer.js.map