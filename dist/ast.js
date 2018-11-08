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
var MemberExpressionNode = /** @class */ (function () {
    function MemberExpressionNode(obj, name) {
        this.obj = obj;
        this.name = name;
    }
    MemberExpressionNode.prototype.evaluate = function (scope) {
        return this.obj.evaluate(scope)[this.name.evaluate(scope)];
    };
    return MemberExpressionNode;
}());
var LiteralNode = /** @class */ (function () {
    function LiteralNode(value) {
        this.value = value;
    }
    LiteralNode.prototype.evaluate = function (scope) {
        return this.value;
    };
    return LiteralNode;
}());
var StringNode = /** @class */ (function () {
    function StringNode(node) {
        this.node = node;
    }
    StringNode.prototype.evaluate = function (scope) {
        return "" + this.node.evaluate(scope);
    };
    return StringNode;
}());
var FunctionCallNode = /** @class */ (function () {
    function FunctionCallNode(fnc, args) {
        this.fnc = fnc;
        this.args = args;
    }
    FunctionCallNode.prototype.evaluate = function (scope) {
        return this.fnc.evaluate(scope).apply(void 0, this.args.evaluate(scope));
    };
    return FunctionCallNode;
}());
var ScopeMemberNode = /** @class */ (function () {
    function ScopeMemberNode(scope, name) {
        this.scope = scope;
        this.name = name;
    }
    ScopeMemberNode.prototype.evaluate = function (scope) {
        return this.scope.evaluate(scope).get(this.name.evaluate(scope));
    };
    return ScopeMemberNode;
}());
var RootScopeMemberNode = /** @class */ (function () {
    function RootScopeMemberNode(name) {
        this.name = name;
    }
    RootScopeMemberNode.prototype.evaluate = function (scope) {
        return scope.get(this.name.evaluate(scope));
    };
    return RootScopeMemberNode;
}());
var Tree = /** @class */ (function () {
    function Tree(code) {
        this.code = code;
        this.tokens = tokenize(code);
        this.rootNode = new MemberExpressionNode(new RootScopeMemberNode(new LiteralNode('test')), new FunctionCallNode(new RootScopeMemberNode(new LiteralNode('func')), new LiteralNode([])));
    }
    Tree.prototype.evaluate = function (scope) {
        return this.rootNode.evaluate(scope);
    };
    return Tree;
}());
exports.Tree = Tree;
//# sourceMappingURL=ast.js.map