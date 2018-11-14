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
    TokenType[TokenType["COMMA"] = 9] = "COMMA";
    TokenType[TokenType["COLON"] = 10] = "COLON";
    TokenType[TokenType["SEMI_COLON"] = 11] = "SEMI_COLON";
    TokenType[TokenType["STRING_LITERAL"] = 12] = "STRING_LITERAL";
    TokenType[TokenType["NUMBER_LITERAL"] = 13] = "NUMBER_LITERAL";
    TokenType[TokenType["BOOLEAN_LITERAL"] = 14] = "BOOLEAN_LITERAL";
    TokenType[TokenType["NULL_LITERAL"] = 15] = "NULL_LITERAL";
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
        type: TokenType.COMMA,
        pattern: /^,/
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
var FunctionArgumentNode = /** @class */ (function () {
    function FunctionArgumentNode(args) {
        this.args = args;
    }
    FunctionArgumentNode.prototype.evaluate = function (scope) {
        var values = [];
        for (var _i = 0, _a = this.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            values.push(arg.evaluate(scope));
        }
        return values;
    };
    return FunctionArgumentNode;
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
        var tokens = tokenize(code);
        this.rootNode = Tree.processTokens(tokens);
    }
    Tree.prototype.evaluate = function (scope) {
        return this.rootNode.evaluate(scope);
    };
    Tree.processTokens = function (tokens) {
        var current = 0;
        var node = null;
        var count = 0;
        while (tokens.length > 0) {
            count++;
            if (count > 1000)
                break;
            var token = tokens[current];
            if (token.type === TokenType.NAME) {
                node = new RootScopeMemberNode(new LiteralNode(token.value));
                tokens.splice(0, 1);
            }
            else if ([TokenType.STRING_LITERAL, TokenType.NUMBER_LITERAL].indexOf(token.type) > -1) {
                node = new LiteralNode(token.value);
            }
            else if (token.type === TokenType.PERIOD && tokens[current + 1].type === TokenType.NAME) {
                node = new ScopeMemberNode(node, new LiteralNode(tokens[current + 1].value));
                tokens.splice(0, 2);
            }
            else if (tokens[0].type === TokenType.L_PAREN) {
                var funcArgs = Tree.getFunctionArgumentTokens(tokens);
                var nodes = [];
                for (var _i = 0, funcArgs_1 = funcArgs; _i < funcArgs_1.length; _i++) {
                    var arg = funcArgs_1[_i];
                    nodes.push(Tree.processTokens(arg));
                }
                node = new FunctionCallNode(node, new FunctionArgumentNode(nodes));
            }
        }
        return node;
    };
    Tree.getFunctionArgumentTokens = function (tokens) {
        var leftParens = 0;
        var argumentTokens = [];
        var tokenSet = [];
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token.type === TokenType.L_PAREN) {
                leftParens += 1;
                if (leftParens > 1)
                    tokenSet.push(token);
            }
            else if (token.type === TokenType.R_PAREN) {
                leftParens -= 1;
                if (leftParens > 0)
                    tokenSet.push(token);
            }
            else if (token.type === TokenType.COMMA && leftParens == 1) {
                argumentTokens.push(tokenSet);
                tokenSet = [];
            }
            else if (token.type === TokenType.WHITESPACE) {
            }
            else {
                tokenSet.push(token);
            }
            // Consume token
            tokens.splice(0, 1);
            i--;
            if (leftParens === 0) {
                argumentTokens.push(tokenSet);
                return argumentTokens;
            }
        }
        throw Error('Invalid Syntax, missing )');
    };
    return Tree;
}());
exports.Tree = Tree;
//# sourceMappingURL=ast.js.map