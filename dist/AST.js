"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = exports.BlockNode = exports.Node = exports.tokenize = exports.TokenType = exports.BlockType = void 0;
var Scope_1 = require("./Scope");
function lower(str) {
    return str ? str.toLowerCase() : null;
}
var BlockType;
(function (BlockType) {
    BlockType[BlockType["BRACE"] = 0] = "BRACE";
    BlockType[BlockType["BRACKET"] = 1] = "BRACKET";
    BlockType[BlockType["PAREN"] = 2] = "PAREN";
})(BlockType = exports.BlockType || (exports.BlockType = {}));
var TokenType;
(function (TokenType) {
    TokenType[TokenType["WHITESPACE"] = 0] = "WHITESPACE";
    TokenType[TokenType["RETURN"] = 1] = "RETURN";
    TokenType[TokenType["OF"] = 2] = "OF";
    TokenType[TokenType["FOR"] = 3] = "FOR";
    TokenType[TokenType["IF"] = 4] = "IF";
    TokenType[TokenType["ELSE_IF"] = 5] = "ELSE_IF";
    TokenType[TokenType["ELSE"] = 6] = "ELSE";
    TokenType[TokenType["NAME"] = 7] = "NAME";
    TokenType[TokenType["L_BRACE"] = 8] = "L_BRACE";
    TokenType[TokenType["R_BRACE"] = 9] = "R_BRACE";
    TokenType[TokenType["L_BRACKET"] = 10] = "L_BRACKET";
    TokenType[TokenType["R_BRACKET"] = 11] = "R_BRACKET";
    TokenType[TokenType["L_PAREN"] = 12] = "L_PAREN";
    TokenType[TokenType["R_PAREN"] = 13] = "R_PAREN";
    TokenType[TokenType["PERIOD"] = 14] = "PERIOD";
    TokenType[TokenType["COMMA"] = 15] = "COMMA";
    TokenType[TokenType["COLON"] = 16] = "COLON";
    TokenType[TokenType["SEMI_COLON"] = 17] = "SEMI_COLON";
    TokenType[TokenType["STRING_LITERAL"] = 18] = "STRING_LITERAL";
    TokenType[TokenType["NUMBER_LITERAL"] = 19] = "NUMBER_LITERAL";
    TokenType[TokenType["BOOLEAN_LITERAL"] = 20] = "BOOLEAN_LITERAL";
    TokenType[TokenType["NULL_LITERAL"] = 21] = "NULL_LITERAL";
    TokenType[TokenType["STRICT_EQUALS"] = 22] = "STRICT_EQUALS";
    TokenType[TokenType["STRICT_NOT_EQUALS"] = 23] = "STRICT_NOT_EQUALS";
    TokenType[TokenType["EQUALS"] = 24] = "EQUALS";
    TokenType[TokenType["NOT_EQUALS"] = 25] = "NOT_EQUALS";
    TokenType[TokenType["GREATER_THAN"] = 26] = "GREATER_THAN";
    TokenType[TokenType["LESS_THAN"] = 27] = "LESS_THAN";
    TokenType[TokenType["GREATER_THAN_EQUAL"] = 28] = "GREATER_THAN_EQUAL";
    TokenType[TokenType["LESS_THAN_EQUAL"] = 29] = "LESS_THAN_EQUAL";
    TokenType[TokenType["ASSIGN"] = 30] = "ASSIGN";
    TokenType[TokenType["AND"] = 31] = "AND";
    TokenType[TokenType["OR"] = 32] = "OR";
    TokenType[TokenType["ADD"] = 33] = "ADD";
    TokenType[TokenType["SUBTRACT"] = 34] = "SUBTRACT";
    TokenType[TokenType["MULTIPLY"] = 35] = "MULTIPLY";
    TokenType[TokenType["DIVIDE"] = 36] = "DIVIDE";
    TokenType[TokenType["ADD_ASSIGN"] = 37] = "ADD_ASSIGN";
    TokenType[TokenType["SUBTRACT_ASSIGN"] = 38] = "SUBTRACT_ASSIGN";
    TokenType[TokenType["MULTIPLY_ASSIGN"] = 39] = "MULTIPLY_ASSIGN";
    TokenType[TokenType["DIVIDE_ASSIGN"] = 40] = "DIVIDE_ASSIGN";
    TokenType[TokenType["EXCLAMATION_POINT"] = 41] = "EXCLAMATION_POINT";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var TOKEN_PATTERNS = [
    {
        type: TokenType.WHITESPACE,
        pattern: /^[\s\n\r]+/
    },
    {
        type: TokenType.BOOLEAN_LITERAL,
        pattern: /^(true|false)/
    },
    {
        type: TokenType.NULL_LITERAL,
        pattern: /^null/
    },
    {
        type: TokenType.RETURN,
        pattern: /^return\s/
    },
    {
        type: TokenType.OF,
        pattern: /^of\s/
    },
    {
        type: TokenType.FOR,
        pattern: /^for\s/
    },
    {
        type: TokenType.IF,
        pattern: /^if\s/
    },
    {
        type: TokenType.ELSE_IF,
        pattern: /^else if\s/
    },
    {
        type: TokenType.ELSE,
        pattern: /^else\s/
    },
    {
        type: TokenType.NAME,
        pattern: /^[\$#_a-zA-Z][_a-zA-Z0-9]*/
    },
    {
        type: TokenType.NUMBER_LITERAL,
        pattern: /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?/i
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
        type: TokenType.EQUALS,
        pattern: /^==/
    },
    {
        type: TokenType.NOT_EQUALS,
        pattern: /^!=/
    },
    {
        type: TokenType.GREATER_THAN,
        pattern: /^>/
    },
    {
        type: TokenType.LESS_THAN,
        pattern: /^</
    },
    {
        type: TokenType.GREATER_THAN_EQUAL,
        pattern: /^>=/
    },
    {
        type: TokenType.LESS_THAN_EQUAL,
        pattern: /^<=/
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
        pattern: /^'([^']*)'/ // Try to make this work: /^(?<!\\)(?:\\\\)*"([^(?<!\\)(?:\\\\)*"]*)(?<!\\)(?:\\\\)*"/
    },
    {
        type: TokenType.AND,
        pattern: /^&&/
    },
    {
        type: TokenType.OR,
        pattern: /^\|\|/
    },
    {
        type: TokenType.ADD_ASSIGN,
        pattern: /^\+=/
    },
    {
        type: TokenType.SUBTRACT_ASSIGN,
        pattern: /^-=/
    },
    {
        type: TokenType.MULTIPLY_ASSIGN,
        pattern: /^\*=/
    },
    {
        type: TokenType.DIVIDE_ASSIGN,
        pattern: /^\/=/
    },
    {
        type: TokenType.ADD,
        pattern: /^\+/
    },
    {
        type: TokenType.SUBTRACT,
        pattern: /^-/
    },
    {
        type: TokenType.MULTIPLY,
        pattern: /^\*/
    },
    {
        type: TokenType.DIVIDE,
        pattern: /^\//
    },
    {
        type: TokenType.ASSIGN,
        pattern: /^=/
    },
    {
        type: TokenType.EXCLAMATION_POINT,
        pattern: /^!/
    },
];
function tokenize(code) {
    var tokens = [];
    if (!code || code.length === 0)
        return tokens;
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
var Node = /** @class */ (function () {
    function Node() {
    }
    Node.prototype.getChildNodes = function () {
        return [];
    };
    Node.prototype.findChildrenByType = function (t) {
        return this.findChildrenByTypes([t]);
    };
    Node.prototype.findChildrenByTypes = function (types) {
        var nodes = [];
        for (var _i = 0, _a = this.getChildNodes(); _i < _a.length; _i++) {
            var child = _a[_i];
            for (var _b = 0, types_1 = types; _b < types_1.length; _b++) {
                var t = types_1[_b];
                if (child instanceof t)
                    nodes.push(child);
                var childNodes = child.findChildrenByType(t);
                nodes.push.apply(nodes, childNodes);
            }
        }
        return nodes;
    };
    return Node;
}());
exports.Node = Node;
var BlockNode = /** @class */ (function (_super) {
    __extends(BlockNode, _super);
    function BlockNode(statements) {
        var _this = _super.call(this) || this;
        _this.statements = statements;
        return _this;
    }
    BlockNode.prototype.getChildNodes = function () {
        return __spreadArray([], this.statements);
    };
    BlockNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var returnValue, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        returnValue = null;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < this.statements.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.statements[i].evaluate(scope)];
                    case 2:
                        returnValue = _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, returnValue];
                }
            });
        });
    };
    return BlockNode;
}(Node));
exports.BlockNode = BlockNode;
var ComparisonNode = /** @class */ (function (_super) {
    __extends(ComparisonNode, _super);
    function ComparisonNode(left, right, type) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.right = right;
        _this.type = type;
        return _this;
    }
    ComparisonNode.prototype.getChildNodes = function () {
        return [
            this.left,
            this.right
        ];
    };
    ComparisonNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.left.evaluate(scope)];
                    case 1:
                        left = _a.sent();
                        return [4 /*yield*/, this.right.evaluate(scope)];
                    case 2:
                        right = _a.sent();
                        switch (this.type) {
                            case TokenType.EQUALS:
                                return [2 /*return*/, left === right];
                            case TokenType.NOT_EQUALS:
                                return [2 /*return*/, left !== right];
                            case TokenType.GREATER_THAN:
                                return [2 /*return*/, left > right];
                            case TokenType.LESS_THAN:
                                return [2 /*return*/, left < right];
                            case TokenType.GREATER_THAN_EQUAL:
                                return [2 /*return*/, left >= right];
                            case TokenType.LESS_THAN_EQUAL:
                                return [2 /*return*/, left <= right];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ComparisonNode.match = function (tokens) {
        return [
            TokenType.EQUALS,
            TokenType.NOT_EQUALS,
            TokenType.GREATER_THAN,
            TokenType.LESS_THAN,
            TokenType.GREATER_THAN_EQUAL,
            TokenType.LESS_THAN_EQUAL
        ].indexOf(tokens[0].type) > -1;
    };
    ComparisonNode.parse = function (lastNode, token, tokens) {
        tokens.splice(0, 1); // Remove comparison operator
        return new ComparisonNode(lastNode, Tree.processTokens(Tree.getNextStatmentTokens(tokens)), token.type);
    };
    return ComparisonNode;
}(Node));
var ConditionalNode = /** @class */ (function (_super) {
    __extends(ConditionalNode, _super);
    function ConditionalNode(condition, block) {
        var _this = _super.call(this) || this;
        _this.condition = condition;
        _this.block = block;
        return _this;
    }
    ConditionalNode.prototype.getChildNodes = function () {
        return [
            this.condition,
            this.block
        ];
    };
    ConditionalNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var one;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.condition.evaluate(scope)];
                    case 1:
                        one = _a.sent();
                        if (!one) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.block.evaluate(scope)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    };
    return ConditionalNode;
}(Node));
var IfStatementNode = /** @class */ (function (_super) {
    __extends(IfStatementNode, _super);
    function IfStatementNode(nodes) {
        var _this = _super.call(this) || this;
        _this.nodes = nodes;
        return _this;
    }
    IfStatementNode.prototype.getChildNodes = function () {
        return __spreadArray([], this.nodes);
    };
    IfStatementNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, condition, uno;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.nodes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        condition = _a[_i];
                        return [4 /*yield*/, condition.condition.evaluate(scope)];
                    case 2:
                        uno = _b.sent();
                        if (!uno) return [3 /*break*/, 4];
                        return [4 /*yield*/, condition.block.evaluate(scope)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    IfStatementNode.parseConditional = function (tokens) {
        if ([
            TokenType.IF,
            TokenType.ELSE_IF
        ].indexOf(tokens[0].type) === -1) {
            console.log('Invalid Syntax');
            throw SyntaxError('Invalid Syntax');
        }
        tokens.splice(0, 1); // consume if and else if
        return new ConditionalNode(Tree.processTokens(Tree.getBlockTokens(tokens, BlockType.PAREN, false)[0]), Tree.processTokens(Tree.getBlockTokens(tokens, BlockType.BRACE, false)[0]));
    };
    IfStatementNode.parse = function (lastNode, token, tokens) {
        if (tokens[1].type !== TokenType.L_PAREN) {
            console.log('If statement needs to be followed by a condition encased in parenthesis.');
            throw SyntaxError('If statement needs to be followed by a condition encased in parenthesis.');
        }
        var nodes = [];
        nodes.push(IfStatementNode.parseConditional(tokens));
        while (tokens.length > 0 && TokenType.ELSE_IF === tokens[0].type) {
            nodes.push(IfStatementNode.parseConditional(tokens));
        }
        if (tokens.length > 0 && TokenType.ELSE === tokens[0].type) {
            tokens.splice(0, 1); // Consume else
            nodes.push(new ConditionalNode(new LiteralNode(true), Tree.processTokens(Tree.getBlockTokens(tokens, BlockType.BRACE, false)[0])));
        }
        return new IfStatementNode(nodes);
    };
    return IfStatementNode;
}(Node));
var ForStatementNode = /** @class */ (function (_super) {
    __extends(ForStatementNode, _super);
    function ForStatementNode(variable, list, block) {
        var _this = _super.call(this) || this;
        _this.variable = variable;
        _this.list = list;
        _this.block = block;
        return _this;
    }
    ForStatementNode.prototype.getChildNodes = function () {
        return [
            this.variable,
            this.list,
            this.block
        ];
    };
    ForStatementNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var variable, list, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.variable.evaluate(scope)];
                    case 1:
                        variable = _a.sent();
                        return [4 /*yield*/, this.list.evaluate(scope)];
                    case 2:
                        list = _a.sent();
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < list.length)) return [3 /*break*/, 6];
                        scope.set(variable, list[i]);
                        return [4 /*yield*/, this.block.evaluate(scope)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, null];
                }
            });
        });
    };
    ForStatementNode.parse = function (lastNode, token, tokens) {
        if (tokens[1].type !== TokenType.L_PAREN) {
            console.log('Syntax error: Missing (');
            throw SyntaxError('Syntax error: Missing (');
        }
        if (tokens[3].type !== TokenType.OF) {
            console.log('Syntax error: Missing of');
            throw SyntaxError('Syntax error: Missing of');
        }
        tokens.splice(0, 1); // consume for
        var loopDef = Tree.getNextStatmentTokens(tokens);
        var variableName = loopDef.splice(0, 1)[0];
        loopDef.splice(0, 1); // consume of
        var list = Tree.processTokens(loopDef);
        var block = Tree.processTokens(Tree.getBlockTokens(tokens, BlockType.BRACE, false)[0]);
        return new ForStatementNode(new LiteralNode(variableName.value), list, block);
    };
    return ForStatementNode;
}(Node));
var MemberExpressionNode = /** @class */ (function (_super) {
    __extends(MemberExpressionNode, _super);
    function MemberExpressionNode(obj, name) {
        var _this = _super.call(this) || this;
        _this.obj = obj;
        _this.name = name;
        return _this;
    }
    MemberExpressionNode.prototype.getChildNodes = function () {
        return [
            this.obj,
            this.name
        ];
    };
    MemberExpressionNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.obj.evaluate(scope);
                        return [4 /*yield*/, this.name.evaluate(scope)];
                    case 1: return [4 /*yield*/, _a[_b.sent()]];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return MemberExpressionNode;
}(Node));
var NotNode = /** @class */ (function (_super) {
    __extends(NotNode, _super);
    function NotNode(toFlip) {
        var _this = _super.call(this) || this;
        _this.toFlip = toFlip;
        return _this;
    }
    NotNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var flipping;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toFlip.evaluate(scope)];
                    case 1:
                        flipping = _a.sent();
                        return [2 /*return*/, !flipping];
                }
            });
        });
    };
    NotNode.prototype.getChildNodes = function () {
        return [
            this.toFlip
        ];
    };
    NotNode.parse = function (lastNode, token, tokens) {
        tokens.splice(0, 1); // Remove not operator
        var containedTokens;
        if (tokens[0].type === TokenType.L_PAREN) {
            containedTokens = Tree.getNextStatmentTokens(tokens);
        }
        else {
            containedTokens = Tree.consumeTypes(tokens, [
                TokenType.BOOLEAN_LITERAL,
                TokenType.NUMBER_LITERAL,
                TokenType.STRING_LITERAL,
                TokenType.NAME,
                TokenType.PERIOD
            ]);
        }
        return new NotNode(Tree.processTokens(containedTokens));
    };
    return NotNode;
}(Node));
var LiteralNode = /** @class */ (function (_super) {
    __extends(LiteralNode, _super);
    function LiteralNode(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    LiteralNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.value];
            });
        });
    };
    return LiteralNode;
}(Node));
var BooleanLiteralNode = /** @class */ (function (_super) {
    __extends(BooleanLiteralNode, _super);
    function BooleanLiteralNode(value) {
        var _this = _super.call(this, value) || this;
        _this.value = value;
        _this.value = value === 'true';
        return _this;
    }
    return BooleanLiteralNode;
}(LiteralNode));
var NumberLiteralNode = /** @class */ (function (_super) {
    __extends(NumberLiteralNode, _super);
    function NumberLiteralNode(value) {
        var _this = _super.call(this, value) || this;
        _this.value = value;
        if (_this.value.indexOf('.') > -1) {
            _this.value = parseFloat(_this.value);
        }
        else {
            _this.value = parseInt(_this.value);
        }
        return _this;
    }
    return NumberLiteralNode;
}(LiteralNode));
var StringNode = /** @class */ (function (_super) {
    __extends(StringNode, _super);
    function StringNode(node) {
        var _this = _super.call(this) || this;
        _this.node = node;
        return _this;
    }
    StringNode.prototype.getChildNodes = function () {
        return [
            this.node
        ];
    };
    StringNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = "";
                        return [4 /*yield*/, this.node.evaluate(scope)];
                    case 1: return [2 /*return*/, _a + (_b.sent())];
                }
            });
        });
    };
    return StringNode;
}(Node));
var FunctionCallNode = /** @class */ (function (_super) {
    __extends(FunctionCallNode, _super);
    function FunctionCallNode(fnc, args) {
        var _this = _super.call(this) || this;
        _this.fnc = fnc;
        _this.args = args;
        return _this;
    }
    FunctionCallNode.prototype.getChildNodes = function () {
        return [
            this.fnc,
            this.args
        ];
    };
    FunctionCallNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var functionScope, values;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        functionScope = scope;
                        if (!(this.fnc instanceof ScopeMemberNode)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fnc.scope.evaluate(scope)];
                    case 1:
                        functionScope = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.args.evaluate(scope)];
                    case 3:
                        values = _b.sent();
                        return [4 /*yield*/, this.fnc.evaluate(scope)];
                    case 4: return [2 /*return*/, (_a = (_b.sent())).call.apply(_a, __spreadArray([functionScope.wrapped || functionScope], values))];
                }
            });
        });
    };
    return FunctionCallNode;
}(Node));
var FunctionArgumentNode = /** @class */ (function (_super) {
    __extends(FunctionArgumentNode, _super);
    function FunctionArgumentNode(args) {
        var _this = _super.call(this) || this;
        _this.args = args;
        return _this;
    }
    FunctionArgumentNode.prototype.getChildNodes = function () {
        return __spreadArray([], this.args);
    };
    FunctionArgumentNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var values, _i, _a, arg, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        values = [];
                        _i = 0, _a = this.args;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        arg = _a[_i];
                        _c = (_b = values).push;
                        return [4 /*yield*/, arg.evaluate(scope)];
                    case 2:
                        _c.apply(_b, [_d.sent()]);
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, values];
                }
            });
        });
    };
    return FunctionArgumentNode;
}(Node));
var ScopeMemberNode = /** @class */ (function (_super) {
    __extends(ScopeMemberNode, _super);
    function ScopeMemberNode(scope, name) {
        var _this = _super.call(this) || this;
        _this.scope = scope;
        _this.name = name;
        return _this;
    }
    ScopeMemberNode.prototype.getChildNodes = function () {
        return [
            this.scope,
            this.name
        ];
    };
    ScopeMemberNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var parent, _a, _b, _c, _d, _e, value, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, this.scope.evaluate(scope)];
                    case 1:
                        parent = _h.sent();
                        if (!!parent) return [3 /*break*/, 5];
                        _b = (_a = console).log;
                        _c = ['failure, scope: ', scope, 'parent scope'];
                        return [4 /*yield*/, this.scope.evaluate(scope)];
                    case 2:
                        _c = _c.concat([_h.sent(), 'member']);
                        return [4 /*yield*/, this.name.evaluate(scope)];
                    case 3:
                        _b.apply(_a, _c.concat([_h.sent()]));
                        _d = Error;
                        _e = "Cannot access \"";
                        return [4 /*yield*/, this.name.evaluate(scope)];
                    case 4: throw _d.apply(void 0, [_e + (_h.sent()) + "\" of undefined."]);
                    case 5:
                        _g = (_f = parent).get;
                        return [4 /*yield*/, this.name.evaluate(scope)];
                    case 6:
                        value = _g.apply(_f, [_h.sent(), false]);
                        return [2 /*return*/, value instanceof Scope_1.Scope && value.wrapped || value];
                }
            });
        });
    };
    return ScopeMemberNode;
}(Node));
var RootScopeMemberNode = /** @class */ (function (_super) {
    __extends(RootScopeMemberNode, _super);
    function RootScopeMemberNode(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        return _this;
    }
    RootScopeMemberNode.prototype.getChildNodes = function () {
        return [
            this.name
        ];
    };
    RootScopeMemberNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var value, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = scope).get;
                        return [4 /*yield*/, this.name.evaluate(scope)];
                    case 1:
                        value = _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/, value instanceof Scope_1.Scope && value.wrapped || value];
                }
            });
        });
    };
    return RootScopeMemberNode;
}(Node));
var AssignmentNode = /** @class */ (function (_super) {
    __extends(AssignmentNode, _super);
    function AssignmentNode(rootNode, toAssign) {
        var _this = _super.call(this) || this;
        _this.rootNode = rootNode;
        _this.toAssign = toAssign;
        return _this;
    }
    AssignmentNode.prototype.getChildNodes = function () {
        return [
            this.rootNode,
            this.toAssign
        ];
    };
    AssignmentNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var localScope, name, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localScope = scope;
                        return [4 /*yield*/, this.rootNode.name.evaluate(scope)];
                    case 1:
                        name = _a.sent();
                        return [4 /*yield*/, this.toAssign.evaluate(scope)];
                    case 2:
                        value = _a.sent();
                        if (!(this.rootNode instanceof ScopeMemberNode)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.rootNode.scope.evaluate(scope)];
                    case 3:
                        localScope = _a.sent();
                        _a.label = 4;
                    case 4:
                        localScope.set(name, value);
                        if (localScope.get(name) !== value)
                            throw Error("System Error: Failed to assign " + name + " to " + value);
                        return [2 /*return*/, value];
                }
            });
        });
    };
    AssignmentNode.parse = function (lastNode, token, tokens) {
        if (!(lastNode instanceof RootScopeMemberNode) && !(lastNode instanceof ScopeMemberNode)) {
            console.log('Invalid assignment syntax.');
            throw SyntaxError("Invalid assignment syntax near " + Tree.toCode(tokens.splice(0, 10)));
        }
        tokens.splice(0, 1); // consume =
        var assignmentTokens = Tree.getNextStatmentTokens(tokens, false);
        return new AssignmentNode(lastNode, Tree.processTokens(assignmentTokens));
    };
    return AssignmentNode;
}(Node));
var ArithmeticNode = /** @class */ (function (_super) {
    __extends(ArithmeticNode, _super);
    function ArithmeticNode(left, right, type) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.right = right;
        _this.type = type;
        return _this;
    }
    ArithmeticNode.prototype.getChildNodes = function () {
        return [
            this.left,
            this.right
        ];
    };
    ArithmeticNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.left.evaluate(scope)];
                    case 1:
                        left = _a.sent();
                        return [4 /*yield*/, this.right.evaluate(scope)];
                    case 2:
                        right = _a.sent();
                        switch (this.type) {
                            case TokenType.ADD:
                                return [2 /*return*/, left + right];
                            case TokenType.SUBTRACT:
                                return [2 /*return*/, left - right];
                            case TokenType.MULTIPLY:
                                return [2 /*return*/, left * right];
                            case TokenType.DIVIDE:
                                return [2 /*return*/, left / right];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ArithmeticNode.match = function (tokens) {
        return [
            TokenType.ADD,
            TokenType.SUBTRACT,
            TokenType.MULTIPLY,
            TokenType.DIVIDE
        ].indexOf(tokens[0].type) > -1;
    };
    ArithmeticNode.parse = function (lastNode, token, tokens) {
        tokens.splice(0, 1); // Remove arithmetic operator
        return new ArithmeticNode(lastNode, Tree.processTokens(Tree.getNextStatmentTokens(tokens)), token.type);
    };
    return ArithmeticNode;
}(Node));
var ArithmeticAssignmentNode = /** @class */ (function (_super) {
    __extends(ArithmeticAssignmentNode, _super);
    function ArithmeticAssignmentNode(left, right, type) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.right = right;
        _this.type = type;
        return _this;
    }
    ArithmeticAssignmentNode.prototype.getChildNodes = function () {
        return [
            this.left,
            this.right
        ];
    };
    ArithmeticAssignmentNode.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var name, left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.left.name.evaluate(scope)];
                    case 1:
                        name = _a.sent();
                        return [4 /*yield*/, this.left.evaluate(scope)];
                    case 2:
                        left = _a.sent();
                        return [4 /*yield*/, this.right.evaluate(scope)];
                    case 3:
                        right = _a.sent();
                        switch (this.type) {
                            case TokenType.ADD_ASSIGN:
                                left += right;
                                break;
                            case TokenType.SUBTRACT_ASSIGN:
                                left -= right;
                                break;
                            case TokenType.MULTIPLY_ASSIGN:
                                left *= right;
                                break;
                            case TokenType.DIVIDE_ASSIGN:
                                left /= right;
                                break;
                        }
                        scope.set(name, left);
                        if (scope.get(name) != left)
                            throw Error("System Error: Failed to assign " + name + " to " + right);
                        return [2 /*return*/, left];
                }
            });
        });
    };
    ArithmeticAssignmentNode.match = function (tokens) {
        return [
            TokenType.ADD_ASSIGN,
            TokenType.SUBTRACT_ASSIGN,
            TokenType.MULTIPLY_ASSIGN,
            TokenType.DIVIDE_ASSIGN
        ].indexOf(tokens[0].type) > -1;
    };
    ArithmeticAssignmentNode.parse = function (lastNode, token, tokens) {
        if (!(lastNode instanceof RootScopeMemberNode) && !(lastNode instanceof ScopeMemberNode)) {
            console.log('Invalid assignment syntax.');
            throw SyntaxError('Invalid assignment syntax.');
        }
        tokens.splice(0, 1); // consume +=
        var assignmentTokens = Tree.getNextStatmentTokens(tokens);
        return new ArithmeticAssignmentNode(lastNode, Tree.processTokens(assignmentTokens), token.type);
    };
    return ArithmeticAssignmentNode;
}(Node));
var Tree = /** @class */ (function () {
    function Tree(code) {
        this.code = code;
        this.parse();
    }
    Tree.prototype.parse = function () {
        var tokens = tokenize(this.code);
        this.rootNode = Tree.processTokens(tokens);
    };
    Tree.prototype.evaluate = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rootNode.evaluate(scope)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Tree.prototype.bindToScopeChanges = function (scope, fnc) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node, _scope, name_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.rootNode.findChildrenByTypes([RootScopeMemberNode, ScopeMemberNode]);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        node = _a[_i];
                        _scope = scope;
                        if (!(node instanceof ScopeMemberNode)) return [3 /*break*/, 3];
                        return [4 /*yield*/, node.scope.evaluate(scope)];
                    case 2:
                        _scope = _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, node.name.evaluate(scope)];
                    case 4:
                        name_1 = _b.sent();
                        _scope.bind("change:" + name_1, fnc);
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Tree.stripWhiteSpace = function (tokens) {
        for (var i = 0; i < tokens.length; i++) {
            if (tokens[i].type === TokenType.WHITESPACE) {
                tokens.splice(i, 1);
                i--;
            }
        }
        return tokens;
    };
    Tree.processTokens = function (tokens) {
        var blockNodes = [];
        var node = null;
        var count = 0;
        Tree.stripWhiteSpace(tokens);
        while (tokens.length > 0) {
            count++;
            if (count > 1000)
                break; // Limit to 1000 iterations while in development
            if (tokens[0].type === TokenType.RETURN)
                tokens.splice(0, 1);
            var token = tokens[0];
            if (token.type === TokenType.NAME) {
                node = new RootScopeMemberNode(new LiteralNode(token.value));
                tokens.splice(0, 1);
            }
            else if (token.type === TokenType.ASSIGN) {
                node = AssignmentNode.parse(node, token, tokens);
            }
            else if (token.type === TokenType.IF) {
                node = IfStatementNode.parse(node, token, tokens);
                blockNodes.push(node);
                node = null;
            }
            else if (token.type === TokenType.FOR) {
                node = ForStatementNode.parse(node, token, tokens);
                blockNodes.push(node);
                node = null;
            }
            else if (token.type === TokenType.STRING_LITERAL) {
                node = new LiteralNode(token.value);
                tokens.splice(0, 1);
            }
            else if (token.type === TokenType.NUMBER_LITERAL) {
                node = new NumberLiteralNode(token.value);
                tokens.splice(0, 1);
            }
            else if (token.type === TokenType.PERIOD && tokens[1].type === TokenType.NAME) {
                node = new ScopeMemberNode(node, new LiteralNode(tokens[1].value));
                tokens.splice(0, 2);
            }
            else if (tokens[0].type === TokenType.L_PAREN) {
                var funcArgs = Tree.getBlockTokens(tokens);
                var nodes = [];
                for (var _i = 0, funcArgs_1 = funcArgs; _i < funcArgs_1.length; _i++) {
                    var arg = funcArgs_1[_i];
                    nodes.push(Tree.processTokens(arg));
                }
                node = new FunctionCallNode(node, // Previous node should be a NAME
                new FunctionArgumentNode(nodes));
            }
            else if (tokens[0].type === TokenType.SEMI_COLON) {
                if (node) {
                    blockNodes.push(node);
                }
                node = null;
                tokens.splice(0, 1);
            }
            else if (ComparisonNode.match(tokens)) {
                node = ComparisonNode.parse(node, token, tokens);
            }
            else if (ArithmeticNode.match(tokens)) {
                node = ArithmeticNode.parse(node, token, tokens);
            }
            else if (ArithmeticAssignmentNode.match(tokens)) {
                node = ArithmeticAssignmentNode.parse(node, token, tokens);
            }
            else if (tokens[0].type === TokenType.WHITESPACE) {
                tokens.splice(0, 1);
            }
            else if (tokens[0].type === TokenType.BOOLEAN_LITERAL) {
                node = new BooleanLiteralNode(tokens[0].value);
                tokens.splice(0, 1);
            }
            else if (tokens[0].type === TokenType.NULL_LITERAL) {
                node = new LiteralNode(null);
                tokens.splice(0, 1);
            }
            else if (tokens[0].type === TokenType.EXCLAMATION_POINT) {
                node = NotNode.parse(node, tokens[0], tokens);
            }
            else {
                var code = Tree.toCode(tokens, 10);
                console.log("Syntax Error. Near " + code);
                throw Error("Syntax Error. Near " + code);
            }
        }
        if (node) {
            blockNodes.push(node);
        }
        return new BlockNode(blockNodes);
    };
    Tree.toCode = function (tokens, limit) {
        var code = '';
        limit = limit || tokens.length;
        for (var i = 0; i < limit; i++) {
            if (!tokens[i])
                break;
            code += tokens[i].value;
        }
        return code;
    };
    Tree.getNextStatmentTokens = function (tokens, consumeSemicolon) {
        if (consumeSemicolon === void 0) { consumeSemicolon = true; }
        var statementTokens = [];
        // Consume opening block
        if ([
            TokenType.L_BRACKET,
            TokenType.L_BRACE,
            TokenType.L_PAREN
        ].indexOf(tokens[0].type) > -1) {
            tokens.splice(0, 1);
        }
        var openParens = 0;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token.type === TokenType.L_PAREN)
                openParens += 1;
            if ([
                TokenType.SEMI_COLON,
                TokenType.R_BRACKET,
                TokenType.R_BRACE,
                TokenType.R_PAREN
            ].indexOf(token.type) > -1) {
                if (consumeSemicolon && token.type !== TokenType.SEMI_COLON)
                    tokens.splice(0, 1); // Consume end of block
                if (openParens > 0 && token.type === TokenType.R_PAREN) {
                    openParens -= 1;
                }
                else {
                    break;
                }
            }
            statementTokens.push(token);
            tokens.splice(0, 1); // Consume part of statement
            i--;
        }
        return statementTokens;
    };
    Tree.getBlockTokens = function (tokens, blockType, groupByComma) {
        if (blockType === void 0) { blockType = BlockType.PAREN; }
        if (groupByComma === void 0) { groupByComma = true; }
        var open = TokenType.L_PAREN;
        var close = TokenType.R_PAREN;
        var closeSymbol = ')';
        switch (blockType) {
            case BlockType.BRACE:
                open = TokenType.L_BRACE;
                close = TokenType.R_BRACE;
                closeSymbol = '}';
                break;
            case BlockType.BRACKET:
                open = TokenType.L_BRACKET;
                close = TokenType.R_BRACKET;
                closeSymbol = ']';
                break;
        }
        var openBlocks = 0;
        var args = [];
        var arg = [];
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token.type === open) {
                openBlocks += 1;
                if (openBlocks > 1)
                    arg.push(token);
            }
            else if (token.type === close) {
                openBlocks -= 1;
                if (openBlocks > 0)
                    arg.push(token);
            }
            else if (groupByComma && token.type === TokenType.COMMA && openBlocks == 1) {
                args.push(arg);
                arg = [];
            }
            else if (token.type !== TokenType.WHITESPACE) {
                arg.push(token);
            }
            // Consume token
            tokens.splice(0, 1);
            i--;
            if (openBlocks === 0) {
                if (arg.length > 0)
                    args.push(arg);
                return args;
            }
        }
        console.log("Invalid Syntax, missing " + closeSymbol);
        throw Error("Invalid Syntax, missing " + closeSymbol);
    };
    Tree.consumeTypes = function (tokens, types) {
        var matching = [];
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            if (types.indexOf(token.type) > -1) {
                matching.push(token);
            }
            else {
                break;
            }
        }
        tokens.splice(0, matching.length);
        return matching;
    };
    return Tree;
}());
exports.Tree = Tree;
//# sourceMappingURL=AST.js.map