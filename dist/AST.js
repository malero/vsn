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
exports.Tree = exports.AttributableNodes = exports.BlockNode = exports.Node = exports.TokenType = exports.BlockType = void 0;
var Scope_1 = require("./Scope");
var DOMObject_1 = require("./DOM/DOMObject");
function lower(str) {
    return str ? str.toLowerCase() : null;
}
var BlockType;
(function (BlockType) {
    BlockType[BlockType["BRACE"] = 0] = "BRACE";
    BlockType[BlockType["BRACKET"] = 1] = "BRACKET";
    BlockType[BlockType["PAREN"] = 2] = "PAREN";
    BlockType[BlockType["STATEMENT"] = 3] = "STATEMENT";
})(BlockType = exports.BlockType || (exports.BlockType = {}));
var TokenType;
(function (TokenType) {
    TokenType[TokenType["WHITESPACE"] = 0] = "WHITESPACE";
    TokenType[TokenType["TYPE_INT"] = 1] = "TYPE_INT";
    TokenType[TokenType["TYPE_UINT"] = 2] = "TYPE_UINT";
    TokenType[TokenType["TYPE_FLOAT"] = 3] = "TYPE_FLOAT";
    TokenType[TokenType["TYPE_STRING"] = 4] = "TYPE_STRING";
    TokenType[TokenType["RETURN"] = 5] = "RETURN";
    TokenType[TokenType["NOT"] = 6] = "NOT";
    TokenType[TokenType["OF"] = 7] = "OF";
    TokenType[TokenType["IN"] = 8] = "IN";
    TokenType[TokenType["FOR"] = 9] = "FOR";
    TokenType[TokenType["IF"] = 10] = "IF";
    TokenType[TokenType["ELSE_IF"] = 11] = "ELSE_IF";
    TokenType[TokenType["ELSE"] = 12] = "ELSE";
    TokenType[TokenType["NAME"] = 13] = "NAME";
    TokenType[TokenType["L_BRACE"] = 14] = "L_BRACE";
    TokenType[TokenType["R_BRACE"] = 15] = "R_BRACE";
    TokenType[TokenType["L_BRACKET"] = 16] = "L_BRACKET";
    TokenType[TokenType["R_BRACKET"] = 17] = "R_BRACKET";
    TokenType[TokenType["L_PAREN"] = 18] = "L_PAREN";
    TokenType[TokenType["R_PAREN"] = 19] = "R_PAREN";
    TokenType[TokenType["TILDE"] = 20] = "TILDE";
    TokenType[TokenType["PERIOD"] = 21] = "PERIOD";
    TokenType[TokenType["COMMA"] = 22] = "COMMA";
    TokenType[TokenType["COLON"] = 23] = "COLON";
    TokenType[TokenType["SEMI_COLON"] = 24] = "SEMI_COLON";
    TokenType[TokenType["STRING_LITERAL"] = 25] = "STRING_LITERAL";
    TokenType[TokenType["NUMBER_LITERAL"] = 26] = "NUMBER_LITERAL";
    TokenType[TokenType["BOOLEAN_LITERAL"] = 27] = "BOOLEAN_LITERAL";
    TokenType[TokenType["NULL_LITERAL"] = 28] = "NULL_LITERAL";
    TokenType[TokenType["STRICT_EQUALS"] = 29] = "STRICT_EQUALS";
    TokenType[TokenType["STRICT_NOT_EQUALS"] = 30] = "STRICT_NOT_EQUALS";
    TokenType[TokenType["EQUALS"] = 31] = "EQUALS";
    TokenType[TokenType["NOT_EQUALS"] = 32] = "NOT_EQUALS";
    TokenType[TokenType["GREATER_THAN_EQUAL"] = 33] = "GREATER_THAN_EQUAL";
    TokenType[TokenType["LESS_THAN_EQUAL"] = 34] = "LESS_THAN_EQUAL";
    TokenType[TokenType["GREATER_THAN"] = 35] = "GREATER_THAN";
    TokenType[TokenType["LESS_THAN"] = 36] = "LESS_THAN";
    TokenType[TokenType["ASSIGN"] = 37] = "ASSIGN";
    TokenType[TokenType["AND"] = 38] = "AND";
    TokenType[TokenType["OR"] = 39] = "OR";
    TokenType[TokenType["ADD"] = 40] = "ADD";
    TokenType[TokenType["SUBTRACT"] = 41] = "SUBTRACT";
    TokenType[TokenType["MULTIPLY"] = 42] = "MULTIPLY";
    TokenType[TokenType["DIVIDE"] = 43] = "DIVIDE";
    TokenType[TokenType["ADD_ASSIGN"] = 44] = "ADD_ASSIGN";
    TokenType[TokenType["SUBTRACT_ASSIGN"] = 45] = "SUBTRACT_ASSIGN";
    TokenType[TokenType["MULTIPLY_ASSIGN"] = 46] = "MULTIPLY_ASSIGN";
    TokenType[TokenType["DIVIDE_ASSIGN"] = 47] = "DIVIDE_ASSIGN";
    TokenType[TokenType["EXCLAMATION_POINT"] = 48] = "EXCLAMATION_POINT";
    TokenType[TokenType["ELEMENT_REFERENCE"] = 49] = "ELEMENT_REFERENCE";
    TokenType[TokenType["ELEMENT_ATTRIBUTE"] = 50] = "ELEMENT_ATTRIBUTE";
    TokenType[TokenType["ELEMENT_QUERY"] = 51] = "ELEMENT_QUERY";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var TOKEN_PATTERNS = [
    {
        type: TokenType.WHITESPACE,
        pattern: /^[\s\n\r]+/
    },
    {
        type: TokenType.TYPE_INT,
        pattern: /^int+/
    },
    {
        type: TokenType.TYPE_UINT,
        pattern: /^uint+/
    },
    {
        type: TokenType.TYPE_FLOAT,
        pattern: /^float+/
    },
    {
        type: TokenType.TYPE_STRING,
        pattern: /^string+/
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
        type: TokenType.NOT,
        pattern: /^not\s/
    },
    {
        type: TokenType.OF,
        pattern: /^of\s/
    },
    {
        type: TokenType.IN,
        pattern: /^in\s/
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
        type: TokenType.ELEMENT_ATTRIBUTE,
        pattern: /^\.@[_a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_REFERENCE,
        pattern: /^#[-_a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_QUERY,
        pattern: /^\?([#.\[\]:,=\-_a-zA-Z0-9*\s]*[\]_a-zA-Z0-9*])/
    },
    {
        type: TokenType.NAME,
        pattern: /^[$_a-zA-Z][_a-zA-Z0-9]*/
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
        type: TokenType.TILDE,
        pattern: /^~/
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
    }
];
var Node = /** @class */ (function () {
    function Node() {
        this.requiresPrep = false;
        this.nodeCache = {};
    }
    Node.prototype.isPreparationRequired = function () {
        if (this.requiresPrep)
            return true;
        if (this._isPreparationRequired !== undefined)
            return this._isPreparationRequired;
        for (var _i = 0, _a = this.getChildNodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.isPreparationRequired()) {
                this._isPreparationRequired = true;
                return true;
            }
        }
        return false;
    };
    Node.prototype.prepare = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.getChildNodes();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        node = _a[_i];
                        return [4 /*yield*/, node.prepare(scope, dom, tag)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype._getChildNodes = function () {
        return [];
    };
    Node.prototype.getChildNodes = function () {
        if (this.childNodes === undefined) {
            this.childNodes = this._getChildNodes();
        }
        return this.childNodes;
    };
    Node.prototype.findChildrenByType = function (t) {
        return this.findChildrenByTypes([t]);
    };
    Node.prototype.findChildrenByTypes = function (types, cacheKey) {
        if (cacheKey === void 0) { cacheKey = null; }
        if (cacheKey !== null && this.nodeCache[cacheKey])
            return this.nodeCache[cacheKey];
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
        if (cacheKey !== null)
            this.nodeCache[cacheKey] = nodes;
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
    BlockNode.prototype._getChildNodes = function () {
        return __spreadArray([], this.statements);
    };
    BlockNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
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
                        return [4 /*yield*/, this.statements[i].evaluate(scope, dom, tag)];
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
    ComparisonNode.prototype._getChildNodes = function () {
        return [
            this.left,
            this.right
        ];
    };
    ComparisonNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.left.evaluate(scope, dom, tag)];
                    case 1:
                        left = _a.sent();
                        return [4 /*yield*/, this.right.evaluate(scope, dom, tag)];
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
        return new ComparisonNode(lastNode, Tree.processTokens(Tree.getNextStatementTokens(tokens)), token.type);
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
    ConditionalNode.prototype._getChildNodes = function () {
        return [
            this.condition,
            this.block
        ];
    };
    ConditionalNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var condition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.condition.evaluate(scope, dom, tag)];
                    case 1:
                        condition = _a.sent();
                        if (!condition) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.block.evaluate(scope, dom, tag)];
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
    IfStatementNode.prototype._getChildNodes = function () {
        return __spreadArray([], this.nodes);
    };
    IfStatementNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
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
                        return [4 /*yield*/, condition.condition.evaluate(scope, dom, tag)];
                    case 2:
                        uno = _b.sent();
                        if (!uno) return [3 /*break*/, 4];
                        return [4 /*yield*/, condition.block.evaluate(scope, dom, tag)];
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
            throw SyntaxError('Invalid Syntax');
        }
        tokens.splice(0, 1); // consume if and else if
        return new ConditionalNode(Tree.processTokens(Tree.getBlockTokens(tokens, null)[0]), Tree.processTokens(Tree.getBlockTokens(tokens, null)[0]));
    };
    IfStatementNode.parse = function (lastNode, token, tokens) {
        if (tokens[1].type !== TokenType.L_PAREN) {
            throw SyntaxError('If statement needs to be followed by a condition encased in parenthesis.');
        }
        var nodes = [];
        nodes.push(IfStatementNode.parseConditional(tokens));
        while (tokens.length > 0 && TokenType.ELSE_IF === tokens[0].type) {
            nodes.push(IfStatementNode.parseConditional(tokens));
        }
        if (tokens.length > 0 && TokenType.ELSE === tokens[0].type) {
            tokens.splice(0, 1); // Consume else
            nodes.push(new ConditionalNode(new LiteralNode(true), Tree.processTokens(Tree.getBlockTokens(tokens, null)[0])));
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
    ForStatementNode.prototype._getChildNodes = function () {
        return [
            this.variable,
            this.list,
            this.block
        ];
    };
    ForStatementNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var variable, list, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.variable.evaluate(scope, dom, tag)];
                    case 1:
                        variable = _a.sent();
                        return [4 /*yield*/, this.list.evaluate(scope, dom, tag)];
                    case 2:
                        list = _a.sent();
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < list.length)) return [3 /*break*/, 6];
                        scope.set(variable, list[i]);
                        return [4 /*yield*/, this.block.evaluate(scope, dom, tag)];
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
            throw SyntaxError('Syntax error: Missing (');
        }
        if (tokens[3].type !== TokenType.OF) {
            throw SyntaxError('Syntax error: Missing of');
        }
        tokens.splice(0, 1); // consume for
        var loopDef = Tree.getNextStatementTokens(tokens);
        var variableName = loopDef.splice(0, 1)[0];
        loopDef.splice(0, 1); // consume of
        var list = Tree.processTokens(loopDef);
        var block = Tree.processTokens(Tree.getBlockTokens(tokens, null)[0]);
        return new ForStatementNode(new LiteralNode(variableName.value), list, block);
    };
    return ForStatementNode;
}(Node));
var NotNode = /** @class */ (function (_super) {
    __extends(NotNode, _super);
    function NotNode(toFlip) {
        var _this = _super.call(this) || this;
        _this.toFlip = toFlip;
        return _this;
    }
    NotNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var flipping;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toFlip.evaluate(scope, dom, tag)];
                    case 1:
                        flipping = _a.sent();
                        return [2 /*return*/, !flipping];
                }
            });
        });
    };
    NotNode.prototype._getChildNodes = function () {
        return [
            this.toFlip
        ];
    };
    NotNode.parse = function (lastNode, token, tokens) {
        tokens.splice(0, 1); // Remove not operator
        var containedTokens;
        if (tokens[0].type === TokenType.L_PAREN) {
            containedTokens = Tree.getNextStatementTokens(tokens);
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
var InNode = /** @class */ (function (_super) {
    __extends(InNode, _super);
    function InNode(left, right, flip) {
        if (flip === void 0) { flip = false; }
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.right = right;
        _this.flip = flip;
        return _this;
    }
    InNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var toCheck, array, inArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.left.evaluate(scope, dom, tag)];
                    case 1:
                        toCheck = _a.sent();
                        return [4 /*yield*/, this.right.evaluate(scope, dom, tag)];
                    case 2:
                        array = _a.sent();
                        inArray = array.indexOf(toCheck) > -1;
                        if (this.flip)
                            inArray = !inArray;
                        return [2 /*return*/, inArray];
                }
            });
        });
    };
    InNode.prototype._getChildNodes = function () {
        return [
            this.left,
            this.right
        ];
    };
    InNode.match = function (tokens) {
        return tokens[0].type === TokenType.IN || (tokens[0].type === TokenType.NOT && tokens[1].type === TokenType.IN);
    };
    InNode.parse = function (lastNode, token, tokens) {
        var flip = tokens[0].type === TokenType.NOT;
        if (flip)
            tokens.splice(0, 1); // consume not
        tokens.splice(0, 1); // consume in
        var containedTokens = Tree.getNextStatementTokens(tokens, false, false, true);
        return new InNode(lastNode, Tree.processTokens(containedTokens), flip);
    };
    return InNode;
}(Node));
var LiteralNode = /** @class */ (function (_super) {
    __extends(LiteralNode, _super);
    function LiteralNode(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    LiteralNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
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
var FunctionCallNode = /** @class */ (function (_super) {
    __extends(FunctionCallNode, _super);
    function FunctionCallNode(fnc, args) {
        var _this = _super.call(this) || this;
        _this.fnc = fnc;
        _this.args = args;
        return _this;
    }
    FunctionCallNode.prototype._getChildNodes = function () {
        return [
            this.fnc,
            this.args
        ];
    };
    FunctionCallNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var functionScope, values;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        functionScope = scope;
                        if (!(this.fnc instanceof ScopeMemberNode)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fnc.scope.evaluate(scope, dom, tag)];
                    case 1:
                        functionScope = _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.args.evaluate(scope, dom, tag)];
                    case 3:
                        values = _b.sent();
                        return [4 /*yield*/, this.fnc.evaluate(scope, dom, tag)];
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
    FunctionArgumentNode.prototype._getChildNodes = function () {
        return __spreadArray([], this.args);
    };
    FunctionArgumentNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
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
                        return [4 /*yield*/, arg.evaluate(scope, dom, tag)];
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
    ScopeMemberNode.prototype._getChildNodes = function () {
        return [
            this.scope,
            this.name
        ];
    };
    ScopeMemberNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var scopes, values, _a, _b, _i, scopes_1, parent_1, _c, _d, name_1, value;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        scopes = [];
                        values = [];
                        if (!(this.scope instanceof ElementQueryNode)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.scope.evaluate(scope, dom, tag)];
                    case 1:
                        scopes = _e.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        _b = (_a = scopes).push;
                        return [4 /*yield*/, this.scope.evaluate(scope, dom, tag)];
                    case 3:
                        _b.apply(_a, [_e.sent()]);
                        _e.label = 4;
                    case 4:
                        _i = 0, scopes_1 = scopes;
                        _e.label = 5;
                    case 5:
                        if (!(_i < scopes_1.length)) return [3 /*break*/, 10];
                        parent_1 = scopes_1[_i];
                        if (parent_1 instanceof DOMObject_1.DOMObject)
                            parent_1 = parent_1.scope;
                        if (!!parent_1) return [3 /*break*/, 7];
                        _c = Error;
                        _d = "Cannot access \"";
                        return [4 /*yield*/, this.name.evaluate(scope, dom, tag)];
                    case 6: throw _c.apply(void 0, [_d + (_e.sent()) + "\" of undefined."]);
                    case 7: return [4 /*yield*/, this.name.evaluate(scope, dom, tag)];
                    case 8:
                        name_1 = _e.sent();
                        value = parent_1.get(name_1, false);
                        values.push(value instanceof Scope_1.Scope && value.wrapped || value);
                        _e.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 5];
                    case 10: return [2 /*return*/, values.length === 1 ? values[0] : values];
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
    RootScopeMemberNode.prototype._getChildNodes = function () {
        return [
            this.name
        ];
    };
    RootScopeMemberNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var value, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = scope).get;
                        return [4 /*yield*/, this.name.evaluate(scope, dom, tag)];
                    case 1:
                        value = _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/, value instanceof Scope_1.Scope && value.wrapped || value];
                }
            });
        });
    };
    return RootScopeMemberNode;
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
    ArithmeticNode.prototype._getChildNodes = function () {
        return [
            this.left,
            this.right
        ];
    };
    ArithmeticNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.left.evaluate(scope, dom, tag)];
                    case 1:
                        left = _a.sent();
                        return [4 /*yield*/, this.right.evaluate(scope, dom, tag)];
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
        return new ArithmeticNode(lastNode, Tree.processTokens(Tree.getNextStatementTokens(tokens)), token.type);
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
    ArithmeticAssignmentNode.prototype._getChildNodes = function () {
        return [
            this.left,
            this.right
        ];
    };
    ArithmeticAssignmentNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var scopes, name, inner, values, _i, scopes_2, localScope, left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scopes = [];
                        return [4 /*yield*/, this.left.name.evaluate(scope, dom, tag)];
                    case 1:
                        name = _a.sent();
                        if (!(this.left instanceof ScopeMemberNode)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.left.scope.evaluate(scope, dom, tag)];
                    case 2:
                        inner = _a.sent();
                        if (this.left.scope instanceof ElementQueryNode) {
                            scopes.push.apply(scopes, inner);
                        }
                        else {
                            scopes.push(inner);
                        }
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(this.left instanceof ElementAttributeNode)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.left.elementRef.evaluate(scope, dom, tag)];
                    case 4:
                        scopes = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        scopes.push(scope);
                        _a.label = 6;
                    case 6:
                        values = [];
                        _i = 0, scopes_2 = scopes;
                        _a.label = 7;
                    case 7:
                        if (!(_i < scopes_2.length)) return [3 /*break*/, 13];
                        localScope = scopes_2[_i];
                        if (!(localScope instanceof DOMObject_1.DOMObject)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.handleDOMObject(name, dom, localScope, tag)];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 9:
                        if (localScope['$wrapped'] && localScope['$scope'])
                            localScope = localScope['$scope'];
                        return [4 /*yield*/, this.left.evaluate(localScope, dom, tag)];
                    case 10:
                        left = _a.sent();
                        return [4 /*yield*/, this.right.evaluate(localScope, dom, tag)];
                    case 11:
                        right = _a.sent();
                        if (left instanceof Array) {
                            left = this.handleArray(name, left, right, localScope);
                        }
                        else if (Number.isFinite(left)) {
                            left = this.handleNumber(name, left, right, localScope);
                        }
                        else {
                            left = this.handleString(name, left, right, localScope);
                        }
                        values.push(left);
                        _a.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 7];
                    case 13: return [2 /*return*/, values.length > 1 ? values : values[0]];
                }
            });
        });
    };
    ArithmeticAssignmentNode.prototype.handleNumber = function (key, left, right, scope) {
        if (right !== null && !Number.isFinite(right))
            right = parseFloat("" + right);
        left = left;
        right = right;
        switch (this.type) {
            case TokenType.ASSIGN:
                left = right;
                break;
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
        scope.set(key, left);
        return left;
    };
    ArithmeticAssignmentNode.prototype.handleString = function (key, left, right, scope) {
        switch (this.type) {
            case TokenType.ASSIGN:
                left = right;
                break;
            case TokenType.ADD_ASSIGN:
                left = "" + left + right;
                break;
            case TokenType.SUBTRACT_ASSIGN:
                left.replace(right, '');
                break;
            case TokenType.MULTIPLY_ASSIGN:
                left *= right;
                break;
            case TokenType.DIVIDE_ASSIGN:
                left /= right;
                break;
        }
        scope.set(key, left);
        return left;
    };
    ArithmeticAssignmentNode.prototype.handleDOMObject = function (key, dom, domObject, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        left = domObject.scope.get(key);
                        return [4 /*yield*/, this.right.evaluate(domObject.scope, dom, tag)];
                    case 1:
                        right = _a.sent();
                        if (left instanceof Array)
                            return [2 /*return*/, this.handleArray(key, left, right, domObject.scope)];
                        return [2 /*return*/, this.handleString(key, left, right, domObject.scope)];
                }
            });
        });
    };
    ArithmeticAssignmentNode.prototype.handleArray = function (key, left, right, scope) {
        if (!(right instanceof Array))
            right = [right];
        switch (this.type) {
            case TokenType.ASSIGN:
                left.splice(0, left.length);
                left.push.apply(left, right);
                break;
            case TokenType.ADD_ASSIGN:
                left.push.apply(left, right);
                break;
            case TokenType.SUBTRACT_ASSIGN:
                for (var i = left.length - 1; i >= 0; i--) {
                    if (right.indexOf(left[i]) > -1) {
                        left.splice(i, 1);
                        i++;
                    }
                }
                break;
            case TokenType.TILDE:
                for (var _i = 0, right_1 = right; _i < right_1.length; _i++) {
                    var toggle = right_1[_i];
                    var index = left.indexOf(toggle);
                    if (index > -1) {
                        left.splice(index, 1);
                    }
                    else {
                        left.push(toggle);
                    }
                }
                break;
        }
        /*
         We have to trigger a change manually here. Setting the variable on the scope with an array won't trigger
         it since we are modifying values inside of the array instance.
         */
        scope.trigger("change:" + key);
        return left;
    };
    ArithmeticAssignmentNode.match = function (tokens) {
        return [
            TokenType.ASSIGN,
            TokenType.ADD_ASSIGN,
            TokenType.SUBTRACT_ASSIGN,
            TokenType.MULTIPLY_ASSIGN,
            TokenType.DIVIDE_ASSIGN,
            TokenType.TILDE,
        ].indexOf(tokens[0].type) > -1;
    };
    ArithmeticAssignmentNode.parse = function (lastNode, token, tokens) {
        if (!(lastNode instanceof RootScopeMemberNode) && !(lastNode instanceof ScopeMemberNode) && !(lastNode instanceof ElementAttributeNode)) {
            throw SyntaxError("Invalid assignment syntax near " + Tree.toCode(tokens.splice(0, 10)));
        }
        tokens.splice(0, 1); // consume =
        var assignmentTokens = Tree.getNextStatementTokens(tokens, false, false, true);
        return new ArithmeticAssignmentNode(lastNode, Tree.processTokens(assignmentTokens), token.type);
    };
    return ArithmeticAssignmentNode;
}(Node));
var IndexNode = /** @class */ (function (_super) {
    __extends(IndexNode, _super);
    function IndexNode(object, index, indexTwo) {
        if (indexTwo === void 0) { indexTwo = null; }
        var _this = _super.call(this) || this;
        _this.object = object;
        _this.index = index;
        _this.indexTwo = indexTwo;
        return _this;
    }
    IndexNode.prototype._getChildNodes = function () {
        var children = [
            this.object,
            this.index
        ];
        if (this.indexTwo)
            children.push(this.indexTwo);
        return children;
    };
    IndexNode.prototype.negativeIndex = function (obj, index) {
        if (Number.isFinite(index) && index < 0)
            return obj.length + index;
        return index;
    };
    IndexNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var obj, index, _a, _b, indexTwo, _c, _d, values, i;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.object.evaluate(scope, dom, tag)];
                    case 1:
                        obj = _e.sent();
                        _a = this.negativeIndex;
                        _b = [obj];
                        return [4 /*yield*/, this.index.evaluate(scope, dom, tag)];
                    case 2:
                        index = _a.apply(this, _b.concat([_e.sent()]));
                        if (!(Number.isFinite(index) && this.indexTwo)) return [3 /*break*/, 4];
                        _c = this.negativeIndex;
                        _d = [obj];
                        return [4 /*yield*/, this.indexTwo.evaluate(scope, dom, tag)];
                    case 3:
                        indexTwo = _c.apply(this, _d.concat([_e.sent()]));
                        values = [];
                        for (i = index; i <= indexTwo; i++) {
                            values.push(obj[i]);
                        }
                        return [2 /*return*/, values];
                    case 4: return [2 /*return*/, (obj)[index]];
                }
            });
        });
    };
    IndexNode.match = function (tokens) {
        return tokens[0].type === TokenType.L_BRACKET;
    };
    IndexNode.parse = function (lastNode, token, tokens) {
        var valueTokens = Tree.getBlockTokens(tokens, TokenType.COLON);
        var values = [];
        for (var _i = 0, valueTokens_1 = valueTokens; _i < valueTokens_1.length; _i++) {
            var arg = valueTokens_1[_i];
            values.push(Tree.processTokens(arg));
        }
        return new IndexNode(lastNode, values[0], values.length > 1 && values[1]);
    };
    return IndexNode;
}(Node));
var ArrayNode = /** @class */ (function (_super) {
    __extends(ArrayNode, _super);
    function ArrayNode(values) {
        var _this = _super.call(this) || this;
        _this.values = values;
        return _this;
    }
    ArrayNode.prototype._getChildNodes = function () {
        return new (Array.bind.apply(Array, __spreadArray([void 0], this.values)))();
    };
    ArrayNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var arr, _i, _a, val, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        arr = [];
                        _i = 0, _a = this.values;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        val = _a[_i];
                        _c = (_b = arr).push;
                        return [4 /*yield*/, val.evaluate(scope, dom, tag)];
                    case 2:
                        _c.apply(_b, [_d.sent()]);
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, arr];
                }
            });
        });
    };
    ArrayNode.match = function (tokens) {
        return tokens[0].type === TokenType.L_BRACKET;
    };
    ArrayNode.parse = function (lastNode, token, tokens) {
        var valueTokens = Tree.getBlockTokens(tokens);
        var values = [];
        for (var _i = 0, valueTokens_2 = valueTokens; _i < valueTokens_2.length; _i++) {
            var arg = valueTokens_2[_i];
            values.push(Tree.processTokens(arg));
        }
        return new ArrayNode(values);
    };
    return ArrayNode;
}(Node));
var ObjectNode = /** @class */ (function (_super) {
    __extends(ObjectNode, _super);
    function ObjectNode(keys, values) {
        var _this = _super.call(this) || this;
        _this.keys = keys;
        _this.values = values;
        return _this;
    }
    ObjectNode.prototype._getChildNodes = function () {
        return new (Array.bind.apply(Array, __spreadArray([void 0], this.values)))();
    };
    ObjectNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var obj, i, key, val, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        obj = new Scope_1.Scope();
                        i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(i < this.values.length)) return [3 /*break*/, 5];
                        key = this.keys[i];
                        val = this.values[i];
                        _b = (_a = obj).set;
                        return [4 /*yield*/, key.evaluate(scope, dom, tag)];
                    case 2:
                        _c = [_d.sent()];
                        return [4 /*yield*/, val.evaluate(scope, dom, tag)];
                    case 3:
                        _b.apply(_a, _c.concat([_d.sent()]));
                        _d.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, obj];
                }
            });
        });
    };
    ObjectNode.match = function (tokens) {
        return tokens[0].type === TokenType.L_BRACE;
    };
    ObjectNode.parse = function (lastNode, token, tokens) {
        var valueTokens = Tree.getNextStatementTokens(tokens);
        var keys = [];
        var values = [];
        while (valueTokens.length > 0) {
            var key = Tree.getTokensUntil(valueTokens, TokenType.COLON, false);
            if (valueTokens[0].type !== TokenType.COLON)
                throw Error('Invalid object literal syntax. Expecting :');
            valueTokens.splice(0, 1); // Consume :
            var val = Tree.getTokensUntil(valueTokens, TokenType.COMMA, true, false, true);
            keys.push(Tree.processTokens(key));
            values.push(Tree.processTokens(val));
        }
        return new ObjectNode(keys, values);
    };
    return ObjectNode;
}(Node));
var ElementQueryNode = /** @class */ (function (_super) {
    __extends(ElementQueryNode, _super);
    function ElementQueryNode(query) {
        var _this = _super.call(this) || this;
        _this.query = query;
        _this.requiresPrep = true;
        return _this;
    }
    ElementQueryNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = tag;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, dom.getTagForScope(scope)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        tag = _a;
                        return [4 /*yield*/, dom.get(this.query, true, tag)];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    ElementQueryNode.prototype.prepare = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = tag;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, dom.getTagForScope(scope)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        tag = _a;
                        return [4 /*yield*/, dom.get(this.query, true, tag)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ElementQueryNode;
}(Node));
var ElementAttributeNode = /** @class */ (function (_super) {
    __extends(ElementAttributeNode, _super);
    function ElementAttributeNode(elementRef, attr) {
        var _this = _super.call(this) || this;
        _this.elementRef = elementRef;
        _this.attr = attr;
        _this.requiresPrep = true;
        return _this;
    }
    Object.defineProperty(ElementAttributeNode.prototype, "name", {
        get: function () {
            return new LiteralNode("@" + this.attributeName);
        },
        enumerable: false,
        configurable: true
    });
    ElementAttributeNode.prototype._getChildNodes = function () {
        return [
            this.elementRef
        ];
    };
    Object.defineProperty(ElementAttributeNode.prototype, "attributeName", {
        get: function () {
            if (this.attr.startsWith('.'))
                return this.attr.substring(2);
            return this.attr.substring(1);
        },
        enumerable: false,
        configurable: true
    });
    ElementAttributeNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tags;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.elementRef.evaluate(scope, dom, tag)];
                    case 1:
                        tags = _a.sent();
                        if (tags.length === 1)
                            return [2 /*return*/, tags[0].scope.get("@" + this.attributeName)];
                        return [2 /*return*/, tags.map(function (tag) { return tag.scope.get("@" + _this.attributeName); })];
                }
            });
        });
    };
    ElementAttributeNode.prototype.prepare = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tags, _i, tags_1, tag_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.elementRef.prepare(scope, dom, tag)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.elementRef.evaluate(scope, dom, tag)];
                    case 2:
                        tags = _a.sent();
                        _i = 0, tags_1 = tags;
                        _a.label = 3;
                    case 3:
                        if (!(_i < tags_1.length)) return [3 /*break*/, 6];
                        tag_1 = tags_1[_i];
                        return [4 /*yield*/, tag_1.watchAttribute(this.attributeName)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return ElementAttributeNode;
}(Node));
exports.AttributableNodes = [
    RootScopeMemberNode,
    ScopeMemberNode,
    ElementAttributeNode
];
var Tree = /** @class */ (function () {
    function Tree(code) {
        this.code = code;
        if (Tree.cache[code]) {
            this.rootNode = Tree.cache[code];
        }
        else {
            this.parse();
            Tree.cache[code] = this.rootNode;
        }
    }
    Tree.prototype.parse = function () {
        var tokens = Tree.tokenize(this.code);
        this.rootNode = Tree.processTokens(tokens);
    };
    Tree.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rootNode.evaluate(scope, dom, tag)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Tree.prototype.prepare = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.rootNode.isPreparationRequired())
                            return [2 /*return*/];
                        return [4 /*yield*/, this.rootNode.prepare(scope, dom, tag)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Tree.prototype.bindToScopeChanges = function (scope, fnc, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node, _scope, name_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.rootNode.findChildrenByTypes([RootScopeMemberNode, ScopeMemberNode, ElementAttributeNode], 'ScopeMemberNodes');
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        node = _a[_i];
                        _scope = scope;
                        if (!(node instanceof ScopeMemberNode)) return [3 /*break*/, 3];
                        return [4 /*yield*/, node.scope.evaluate(scope, dom)];
                    case 2:
                        _scope = _b.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(node instanceof ElementAttributeNode)) return [3 /*break*/, 5];
                        return [4 /*yield*/, node.elementRef.evaluate(scope, dom, tag)];
                    case 4:
                        _scope = (_b.sent())[0].scope;
                        _b.label = 5;
                    case 5: return [4 /*yield*/, node.name.evaluate(scope, dom, tag)];
                    case 6:
                        name_2 = _b.sent();
                        _scope.bind("change:" + name_2, fnc);
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Tree.tokenize = function (code) {
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
            else if (tokens[0].type === TokenType.ELEMENT_REFERENCE) {
                node = new ElementQueryNode(tokens[0].value);
                tokens.splice(0, 1);
            }
            else if (tokens[0].type === TokenType.ELEMENT_QUERY) {
                node = new ElementQueryNode(tokens[0].value);
                tokens.splice(0, 1);
            }
            else if (tokens[0].type === TokenType.L_BRACKET) {
                if (node) {
                    node = IndexNode.parse(node, token, tokens);
                }
                else {
                    node = ArrayNode.parse(node, token, tokens);
                }
            }
            else if (tokens[0].type === TokenType.L_BRACE) {
                node = ObjectNode.parse(node, token, tokens);
            }
            else if (tokens[0].type === TokenType.ELEMENT_ATTRIBUTE && node instanceof ElementQueryNode) {
                node = new ElementAttributeNode(node, tokens[0].value);
                tokens.splice(0, 1);
            }
            else if (node !== null && token.type === TokenType.PERIOD && tokens[1].type === TokenType.NAME) {
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
                if (node) {
                    node = new FunctionCallNode(node, // Previous node should be a NAME
                    new FunctionArgumentNode(nodes));
                }
                else {
                    node = new BlockNode(nodes);
                }
            }
            else if (tokens[0].type === TokenType.SEMI_COLON) {
                if (node) {
                    blockNodes.push(node);
                }
                node = null;
                tokens.splice(0, 1);
            }
            else if (InNode.match(tokens)) {
                node = InNode.parse(node, token, tokens);
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
    Tree.getBlockInfo = function (tokens) {
        var blockType;
        var opener = tokens[0];
        if (opener.type === TokenType.L_PAREN)
            blockType = BlockType.PAREN;
        else if (opener.type === TokenType.L_BRACE)
            blockType = BlockType.BRACE;
        else if (opener.type === TokenType.L_BRACKET)
            blockType = BlockType.BRACKET;
        else
            blockType = BlockType.STATEMENT;
        var open;
        var close;
        var openCharacter;
        var closeCharacter;
        switch (blockType) {
            case BlockType.PAREN:
                open = TokenType.L_PAREN;
                close = TokenType.R_PAREN;
                openCharacter = '(';
                closeCharacter = ')';
                break;
            case BlockType.BRACE:
                open = TokenType.L_BRACE;
                close = TokenType.R_BRACE;
                openCharacter = '{';
                closeCharacter = '}';
                break;
            case BlockType.BRACKET:
                open = TokenType.L_BRACKET;
                close = TokenType.R_BRACKET;
                openCharacter = '[';
                closeCharacter = ']';
                break;
            default:
                open = null;
                close = TokenType.SEMI_COLON;
                openCharacter = null;
                closeCharacter = ';';
                break;
        }
        return {
            type: blockType,
            open: open,
            close: close,
            openCharacter: openCharacter,
            closeCharacter: closeCharacter
        };
    };
    Tree.getNextStatementTokens = function (tokens, consumeClosingToken, consumeOpeningToken, includeClosingToken) {
        if (consumeClosingToken === void 0) { consumeClosingToken = true; }
        if (consumeOpeningToken === void 0) { consumeOpeningToken = true; }
        if (includeClosingToken === void 0) { includeClosingToken = false; }
        var blockInfo = Tree.getBlockInfo(tokens);
        // Consume opening block token
        if (consumeOpeningToken && tokens[0].type === blockInfo.open) {
            tokens.splice(0, 1);
        }
        return Tree.getTokensUntil(tokens, blockInfo.close, consumeClosingToken, includeClosingToken);
    };
    Tree.getBlockTokens = function (tokens, groupBy) {
        if (groupBy === void 0) { groupBy = TokenType.COMMA; }
        var blockInfo = Tree.getBlockInfo(tokens);
        var openBlocks = 0;
        var args = [];
        var arg = [];
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token.type === blockInfo.open) {
                openBlocks += 1;
                if (openBlocks > 1)
                    arg.push(token);
            }
            else if (token.type === blockInfo.close) {
                openBlocks -= 1;
                if (openBlocks > 0)
                    arg.push(token);
            }
            else if (groupBy !== null && token.type === groupBy && openBlocks == 1) {
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
        throw Error("Invalid Syntax, missing " + blockInfo.closeCharacter);
    };
    Tree.getTokensUntil = function (tokens, terminator, consumeTerminator, includeTerminator, validIfTerminatorNotFound) {
        if (terminator === void 0) { terminator = TokenType.SEMI_COLON; }
        if (consumeTerminator === void 0) { consumeTerminator = true; }
        if (includeTerminator === void 0) { includeTerminator = false; }
        if (validIfTerminatorNotFound === void 0) { validIfTerminatorNotFound = false; }
        var statementTokens = [];
        var blockInfo = Tree.getBlockInfo(tokens);
        var openParens = 0;
        var openBraces = 0;
        var openBrackets = 0;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (!(token.type === blockInfo.open && i === 0)) { // Skip opener
                if (token.type === TokenType.L_PAREN)
                    openParens += 1;
                if (token.type === TokenType.L_BRACE)
                    openBraces += 1;
                if (token.type === TokenType.L_BRACKET)
                    openBrackets += 1;
            }
            if ([
                terminator,
                TokenType.R_BRACKET,
                TokenType.R_BRACE,
                TokenType.R_PAREN
            ].indexOf(token.type) > -1) {
                if (openParens > 0 && token.type === TokenType.R_PAREN) {
                    openParens -= 1;
                }
                else if (openBraces > 0 && token.type === TokenType.R_BRACE) {
                    openBraces -= 1;
                }
                else if (openBrackets > 0 && token.type === TokenType.R_BRACKET) {
                    openBrackets -= 1;
                }
                else if (openParens === 0 && openBraces === 0 && openBrackets === 0 && token.type === terminator) {
                    if (includeTerminator)
                        statementTokens.push(token);
                    if ((includeTerminator || consumeTerminator) && token.type !== TokenType.SEMI_COLON)
                        tokens.splice(0, 1); // Consume end of block
                    break;
                }
                else {
                    if (validIfTerminatorNotFound)
                        break;
                    throw Error("Invalid syntax, expecting " + terminator + ".");
                }
            }
            statementTokens.push(token);
            tokens.splice(0, 1); // Consume part of statement
            i--;
        }
        return statementTokens;
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
    Tree.cache = {};
    return Tree;
}());
exports.Tree = Tree;
//# sourceMappingURL=AST.js.map