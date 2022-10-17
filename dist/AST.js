"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = exports.AttributableNodes = exports.TokenType = exports.BlockType = void 0;
var RootScopeMemberNode_1 = require("./AST/RootScopeMemberNode");
var ScopeMemberNode_1 = require("./AST/ScopeMemberNode");
var ElementAttributeNode_1 = require("./AST/ElementAttributeNode");
var BlockNode_1 = require("./AST/BlockNode");
var LiteralNode_1 = require("./AST/LiteralNode");
var IfStatementNode_1 = require("./AST/IfStatementNode");
var ForStatementNode_1 = require("./AST/ForStatementNode");
var NumberLiteralNode_1 = require("./AST/NumberLiteralNode");
var ElementQueryNode_1 = require("./AST/ElementQueryNode");
var IndexNode_1 = require("./AST/IndexNode");
var ArrayNode_1 = require("./AST/ArrayNode");
var ObjectNode_1 = require("./AST/ObjectNode");
var ElementStyleNode_1 = require("./AST/ElementStyleNode");
var FunctionCallNode_1 = require("./AST/FunctionCallNode");
var FunctionArgumentNode_1 = require("./AST/FunctionArgumentNode");
var InNode_1 = require("./AST/InNode");
var ComparisonNode_1 = require("./AST/ComparisonNode");
var ArithmeticNode_1 = require("./AST/ArithmeticNode");
var AssignmentNode_1 = require("./AST/AssignmentNode");
var UnitLiteralNode_1 = require("./AST/UnitLiteralNode");
var BooleanLiteralNode_1 = require("./AST/BooleanLiteralNode");
var NotNode_1 = require("./AST/NotNode");
var XHRNode_1 = require("./AST/XHRNode");
var StringFormatNode_1 = require("./AST/StringFormatNode");
var FunctionNode_1 = require("./AST/FunctionNode");
var ClassNode_1 = require("./AST/ClassNode");
var OnNode_1 = require("./AST/OnNode");
var ModifierNode_1 = require("./AST/ModifierNode");
var DispatchEventNode_1 = require("./AST/DispatchEventNode");
var WithNode_1 = require("./AST/WithNode");
var AsNode_1 = require("./AST/AsNode");
var NamedStackNode_1 = require("./AST/NamedStackNode");
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
    TokenType[TokenType["NULL"] = 0] = "NULL";
    TokenType[TokenType["WHITESPACE"] = 1] = "WHITESPACE";
    TokenType[TokenType["TYPE_INT"] = 2] = "TYPE_INT";
    TokenType[TokenType["TYPE_UINT"] = 3] = "TYPE_UINT";
    TokenType[TokenType["TYPE_FLOAT"] = 4] = "TYPE_FLOAT";
    TokenType[TokenType["TYPE_STRING"] = 5] = "TYPE_STRING";
    TokenType[TokenType["RETURN"] = 6] = "RETURN";
    TokenType[TokenType["NOT"] = 7] = "NOT";
    TokenType[TokenType["OF"] = 8] = "OF";
    TokenType[TokenType["AS"] = 9] = "AS";
    TokenType[TokenType["IN"] = 10] = "IN";
    TokenType[TokenType["WITH"] = 11] = "WITH";
    TokenType[TokenType["NAMED_STACK"] = 12] = "NAMED_STACK";
    TokenType[TokenType["FOR"] = 13] = "FOR";
    TokenType[TokenType["IF"] = 14] = "IF";
    TokenType[TokenType["ELSE_IF"] = 15] = "ELSE_IF";
    TokenType[TokenType["ELSE"] = 16] = "ELSE";
    TokenType[TokenType["FUNC"] = 17] = "FUNC";
    TokenType[TokenType["ON"] = 18] = "ON";
    TokenType[TokenType["CLASS"] = 19] = "CLASS";
    TokenType[TokenType["NAME"] = 20] = "NAME";
    TokenType[TokenType["L_BRACE"] = 21] = "L_BRACE";
    TokenType[TokenType["R_BRACE"] = 22] = "R_BRACE";
    TokenType[TokenType["L_BRACKET"] = 23] = "L_BRACKET";
    TokenType[TokenType["R_BRACKET"] = 24] = "R_BRACKET";
    TokenType[TokenType["L_PAREN"] = 25] = "L_PAREN";
    TokenType[TokenType["R_PAREN"] = 26] = "R_PAREN";
    TokenType[TokenType["TILDE"] = 27] = "TILDE";
    TokenType[TokenType["PERIOD"] = 28] = "PERIOD";
    TokenType[TokenType["COMMA"] = 29] = "COMMA";
    TokenType[TokenType["COLON"] = 30] = "COLON";
    TokenType[TokenType["SEMICOLON"] = 31] = "SEMICOLON";
    TokenType[TokenType["STRING_FORMAT"] = 32] = "STRING_FORMAT";
    TokenType[TokenType["STRING_LITERAL"] = 33] = "STRING_LITERAL";
    TokenType[TokenType["NUMBER_LITERAL"] = 34] = "NUMBER_LITERAL";
    TokenType[TokenType["BOOLEAN_LITERAL"] = 35] = "BOOLEAN_LITERAL";
    TokenType[TokenType["NULL_LITERAL"] = 36] = "NULL_LITERAL";
    TokenType[TokenType["STRICT_EQUALS"] = 37] = "STRICT_EQUALS";
    TokenType[TokenType["STRICT_NOT_EQUALS"] = 38] = "STRICT_NOT_EQUALS";
    TokenType[TokenType["EQUALS"] = 39] = "EQUALS";
    TokenType[TokenType["NOT_EQUALS"] = 40] = "NOT_EQUALS";
    TokenType[TokenType["GREATER_THAN_EQUAL"] = 41] = "GREATER_THAN_EQUAL";
    TokenType[TokenType["LESS_THAN_EQUAL"] = 42] = "LESS_THAN_EQUAL";
    TokenType[TokenType["GREATER_THAN"] = 43] = "GREATER_THAN";
    TokenType[TokenType["LESS_THAN"] = 44] = "LESS_THAN";
    TokenType[TokenType["ASSIGN"] = 45] = "ASSIGN";
    TokenType[TokenType["AND"] = 46] = "AND";
    TokenType[TokenType["OR"] = 47] = "OR";
    TokenType[TokenType["ADD"] = 48] = "ADD";
    TokenType[TokenType["SUBTRACT"] = 49] = "SUBTRACT";
    TokenType[TokenType["MULTIPLY"] = 50] = "MULTIPLY";
    TokenType[TokenType["DIVIDE"] = 51] = "DIVIDE";
    TokenType[TokenType["ADD_ASSIGN"] = 52] = "ADD_ASSIGN";
    TokenType[TokenType["SUBTRACT_ASSIGN"] = 53] = "SUBTRACT_ASSIGN";
    TokenType[TokenType["MULTIPLY_ASSIGN"] = 54] = "MULTIPLY_ASSIGN";
    TokenType[TokenType["DIVIDE_ASSIGN"] = 55] = "DIVIDE_ASSIGN";
    TokenType[TokenType["EXCLAMATION_POINT"] = 56] = "EXCLAMATION_POINT";
    TokenType[TokenType["ELEMENT_REFERENCE"] = 57] = "ELEMENT_REFERENCE";
    TokenType[TokenType["ELEMENT_ATTRIBUTE"] = 58] = "ELEMENT_ATTRIBUTE";
    TokenType[TokenType["ELEMENT_STYLE"] = 59] = "ELEMENT_STYLE";
    TokenType[TokenType["ELEMENT_QUERY"] = 60] = "ELEMENT_QUERY";
    TokenType[TokenType["UNIT"] = 61] = "UNIT";
    TokenType[TokenType["XHR_GET"] = 62] = "XHR_GET";
    TokenType[TokenType["XHR_POST"] = 63] = "XHR_POST";
    TokenType[TokenType["XHR_PUT"] = 64] = "XHR_PUT";
    TokenType[TokenType["XHR_DELETE"] = 65] = "XHR_DELETE";
    TokenType[TokenType["MODIFIER"] = 66] = "MODIFIER";
    TokenType[TokenType["DISPATCH_EVENT"] = 67] = "DISPATCH_EVENT";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var TOKEN_PATTERNS = [
    {
        type: TokenType.WHITESPACE,
        pattern: /^[\s\n\r]+/
    },
    {
        type: TokenType.XHR_POST,
        pattern: /^>>/
    },
    {
        type: TokenType.XHR_PUT,
        pattern: /^<>/
    },
    {
        type: TokenType.XHR_GET,
        pattern: /^<</
    },
    {
        type: TokenType.XHR_DELETE,
        pattern: /^></
    },
    {
        type: TokenType.DISPATCH_EVENT,
        pattern: /^!!!?([_a-zA-Z][-_a-zA-Z0-9]+)/
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
        type: TokenType.UNIT,
        pattern: /^\d+\.?\d?(?:cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)/
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
        type: TokenType.AS,
        pattern: /^as\s/
    },
    {
        type: TokenType.WITH,
        pattern: /^with(?=\||\s)?/ // Allows with|sequential
    },
    {
        type: TokenType.NAMED_STACK,
        pattern: /^stack(?=\||\s)?/
    },
    {
        type: TokenType.FOR,
        pattern: /^for\s?(?=\()/
    },
    {
        type: TokenType.IF,
        pattern: /^if\s?(?=\()/
    },
    {
        type: TokenType.ELSE_IF,
        pattern: /^else if\s?(?=\()/
    },
    {
        type: TokenType.ELSE,
        pattern: /^else\s?(?=\{)/
    },
    {
        type: TokenType.FUNC,
        pattern: /^func\s/
    },
    {
        type: TokenType.ON,
        pattern: /^on\s/
    },
    {
        type: TokenType.CLASS,
        pattern: /^class\s/
    },
    {
        type: TokenType.ELEMENT_ATTRIBUTE,
        pattern: /^\.?@[-_a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_STYLE,
        pattern: /^\.?\$[-a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_REFERENCE,
        pattern: /^#[-_a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_QUERY,
        pattern: /^\?[>|<]?\(([#.\[\]:,=\-_a-zA-Z0-9*\s]*[\]_a-zA-Z0-9*])\)/
    },
    {
        type: TokenType.NAME,
        pattern: /^[_a-zA-Z][_a-zA-Z0-9]*/
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
        type: TokenType.GREATER_THAN_EQUAL,
        pattern: /^>=/
    },
    {
        type: TokenType.LESS_THAN_EQUAL,
        pattern: /^<=/
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
        type: TokenType.COLON,
        pattern: /^:/
    },
    {
        type: TokenType.SEMICOLON,
        pattern: /^;/
    },
    {
        type: TokenType.STRING_FORMAT,
        pattern: /^`([^`]*)`/
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
    {
        type: TokenType.MODIFIER,
        pattern: /^\|\S+/
    }
];
exports.AttributableNodes = [
    RootScopeMemberNode_1.RootScopeMemberNode,
    ScopeMemberNode_1.ScopeMemberNode,
    ElementAttributeNode_1.ElementAttributeNode
];
var Tree = /** @class */ (function () {
    function Tree(code) {
        this.code = code;
        if (Tree.cache[code]) {
            this._root = Tree.cache[code];
        }
        else {
            this.parse();
            Tree.cache[code] = this._root;
        }
    }
    Object.defineProperty(Tree.prototype, "root", {
        get: function () { return this._root; },
        enumerable: false,
        configurable: true
    });
    Tree.prototype.parse = function () {
        var tokens = Tree.tokenize(this.code);
        this._root = Tree.processTokens(tokens);
    };
    Tree.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._root.evaluate(scope, dom, tag)];
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
                        if (!this._root.isPreparationRequired())
                            return [2 /*return*/];
                        return [4 /*yield*/, this._root.prepare(scope, dom, tag, {
                                initial: true
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Tree.prototype.bindToScopeChanges = function (scope, fnc, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node, _scope, name_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this._root.findChildrenByTypes([RootScopeMemberNode_1.RootScopeMemberNode, ScopeMemberNode_1.ScopeMemberNode, ElementAttributeNode_1.ElementAttributeNode], 'ScopeMemberNodes');
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        node = _a[_i];
                        _scope = scope;
                        if (!(node instanceof ScopeMemberNode_1.ScopeMemberNode)) return [3 /*break*/, 3];
                        return [4 /*yield*/, node.scope.evaluate(scope, dom)];
                    case 2:
                        _scope = _b.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(node instanceof ElementAttributeNode_1.ElementAttributeNode && node.elementRef)) return [3 /*break*/, 5];
                        return [4 /*yield*/, node.elementRef.evaluate(scope, dom, tag)];
                    case 4:
                        _scope = (_b.sent())[0].scope;
                        _b.label = 5;
                    case 5: return [4 /*yield*/, node.name.evaluate(scope, dom, tag)];
                    case 6:
                        name_1 = _b.sent();
                        _scope.on("change:" + name_1, fnc);
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
                        value: match[match.length - 1],
                        full: match[0],
                        groups: match
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
    Tree.processTokens = function (tokens, _node, _lastBlock) {
        if (_node === void 0) { _node = null; }
        if (_lastBlock === void 0) { _lastBlock = null; }
        var blockNodes = [];
        var lastBlock = _lastBlock;
        var node = _node;
        var count = 0;
        Tree.stripWhiteSpace(tokens);
        while (tokens.length > 0) {
            count++;
            if (count > 1000)
                break; // Limit to 1000 iterations while in development
            if (tokens[0].type === TokenType.RETURN)
                tokens.shift();
            var token = tokens[0];
            if (token.type === TokenType.NAME) {
                node = new RootScopeMemberNode_1.RootScopeMemberNode(new LiteralNode_1.LiteralNode(token.value));
                tokens.shift();
            }
            else if (XHRNode_1.XHRNode.match(tokens)) {
                node = XHRNode_1.XHRNode.parse(node, tokens[0], tokens);
            }
            else if (token.type === TokenType.DISPATCH_EVENT) {
                node = DispatchEventNode_1.DispatchEventNode.parse(node, tokens[0], tokens);
            }
            else if (token.type === TokenType.WITH) {
                node = WithNode_1.WithNode.parse(node, tokens[0], tokens);
                lastBlock = node;
                blockNodes.push(node);
                node = null;
            }
            else if (token.type === TokenType.NAMED_STACK) {
                node = NamedStackNode_1.NamedStackNode.parse(node, tokens[0], tokens);
                lastBlock = node;
                blockNodes.push(node);
                node = null;
            }
            else if (token.type === TokenType.AS) {
                node = AsNode_1.AsNode.parse(node, tokens[0], tokens);
            }
            else if (token.type === TokenType.IF) {
                node = IfStatementNode_1.IfStatementNode.parse(node, token, tokens);
                lastBlock = node;
                blockNodes.push(node);
                node = null;
            }
            else if (token.type === TokenType.FOR) {
                node = ForStatementNode_1.ForStatementNode.parse(node, token, tokens);
                lastBlock = node;
                blockNodes.push(node);
                node = null;
            }
            else if (token.type === TokenType.FUNC) {
                node = FunctionNode_1.FunctionNode.parse(node, token, tokens);
                lastBlock = node;
                blockNodes.push(node);
                node = null;
            }
            else if (token.type === TokenType.ON) {
                node = OnNode_1.OnNode.parse(node, token, tokens);
                lastBlock = node;
                blockNodes.push(node);
                node = null;
            }
            else if (token.type === TokenType.CLASS) {
                node = ClassNode_1.ClassNode.parse(node, token, tokens);
                lastBlock = node;
                blockNodes.push(node);
                node = null;
            }
            else if (StringFormatNode_1.StringFormatNode.match(tokens)) {
                node = StringFormatNode_1.StringFormatNode.parse(node, tokens[0], tokens);
            }
            else if (token.type === TokenType.STRING_LITERAL) {
                node = new LiteralNode_1.LiteralNode(token.value);
                tokens.shift();
            }
            else if (token.type === TokenType.NUMBER_LITERAL) {
                node = new NumberLiteralNode_1.NumberLiteralNode(token.value);
                tokens.shift();
            }
            else if (tokens[0].type === TokenType.ELEMENT_REFERENCE) {
                node = new ElementQueryNode_1.ElementQueryNode(tokens[0].value, true);
                tokens.shift();
            }
            else if (tokens[0].type === TokenType.ELEMENT_QUERY) {
                node = ElementQueryNode_1.ElementQueryNode.parse(node, tokens[0], tokens);
            }
            else if (tokens[0].type === TokenType.L_BRACKET) {
                if (node) {
                    node = IndexNode_1.IndexNode.parse(node, token, tokens);
                }
                else {
                    node = ArrayNode_1.ArrayNode.parse(node, token, tokens);
                }
            }
            else if (tokens[0].type === TokenType.L_BRACE) {
                node = ObjectNode_1.ObjectNode.parse(node, token, tokens);
            }
            else if (tokens[0].type === TokenType.ELEMENT_ATTRIBUTE) {
                node = new ElementAttributeNode_1.ElementAttributeNode(node, tokens[0].value);
                tokens.shift();
            }
            else if (tokens[0].type === TokenType.ELEMENT_STYLE) {
                node = new ElementStyleNode_1.ElementStyleNode(node, tokens[0].value);
                tokens.shift();
            }
            else if (node !== null && token.type === TokenType.PERIOD && tokens[1].type === TokenType.NAME) {
                node = new ScopeMemberNode_1.ScopeMemberNode(node, new LiteralNode_1.LiteralNode(tokens[1].value));
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
                    node = new FunctionCallNode_1.FunctionCallNode(node, // Previous node should be a NAME
                    new FunctionArgumentNode_1.FunctionArgumentNode(nodes));
                }
                else {
                    node = new BlockNode_1.BlockNode(nodes);
                }
            }
            else if (tokens[0].type === TokenType.SEMICOLON) {
                if (node) {
                    blockNodes.push(node);
                }
                node = null;
                tokens.shift();
            }
            else if (InNode_1.InNode.match(tokens)) {
                node = InNode_1.InNode.parse(node, token, tokens);
            }
            else if (ComparisonNode_1.ComparisonNode.match(tokens)) {
                node = ComparisonNode_1.ComparisonNode.parse(node, token, tokens);
            }
            else if (ArithmeticNode_1.ArithmeticNode.match(tokens)) {
                node = ArithmeticNode_1.ArithmeticNode.parse(node, token, tokens);
            }
            else if (AssignmentNode_1.AssignmentNode.match(tokens)) {
                node = AssignmentNode_1.AssignmentNode.parse(node, token, tokens);
            }
            else if (tokens[0].type === TokenType.WHITESPACE) {
                tokens.shift();
            }
            else if (tokens[0].type === TokenType.UNIT) {
                node = new UnitLiteralNode_1.UnitLiteralNode(tokens[0].value);
                tokens.shift();
            }
            else if (tokens[0].type === TokenType.BOOLEAN_LITERAL) {
                node = new BooleanLiteralNode_1.BooleanLiteralNode(tokens[0].value);
                tokens.shift();
            }
            else if (tokens[0].type === TokenType.NULL_LITERAL) {
                node = new LiteralNode_1.LiteralNode(null);
                tokens.shift();
            }
            else if (tokens[0].type === TokenType.EXCLAMATION_POINT) {
                node = NotNode_1.NotNode.parse(node, tokens[0], tokens);
            }
            else if (tokens[0].type === TokenType.MODIFIER) {
                ModifierNode_1.ModifierNode.parse(node ? node : lastBlock, tokens[0], tokens);
            }
            else {
                var code = Tree.toCode(tokens, 10);
                throw Error("Syntax Error. Near " + code);
            }
        }
        if (node) {
            blockNodes.push(node);
        }
        return new BlockNode_1.BlockNode(blockNodes);
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
                close = TokenType.SEMICOLON;
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
            tokens.shift();
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
            tokens.shift();
            i--;
            if (openBlocks === 0) {
                if (arg.length > 0)
                    args.push(arg);
                return args;
            }
        }
        throw Error("Invalid Syntax, missing " + blockInfo.closeCharacter);
    };
    Tree.getTokensUntil = function (tokens, terminator, consumeTerminator, includeTerminator, validIfTerminatorNotFound, blockInfo) {
        if (terminator === void 0) { terminator = TokenType.SEMICOLON; }
        if (consumeTerminator === void 0) { consumeTerminator = true; }
        if (includeTerminator === void 0) { includeTerminator = false; }
        if (validIfTerminatorNotFound === void 0) { validIfTerminatorNotFound = false; }
        if (blockInfo === void 0) { blockInfo = null; }
        var statementTokens = [];
        blockInfo = blockInfo || Tree.getBlockInfo(tokens);
        var openParens = 0;
        var openBraces = 0;
        var openBrackets = 0;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (!(token.type === blockInfo.open && i === 0)) { // Skip opener
                if (token.type === TokenType.L_PAREN && terminator !== TokenType.L_PAREN)
                    openParens += 1;
                if (token.type === TokenType.L_BRACE && terminator !== TokenType.L_BRACE)
                    openBraces += 1;
                if (token.type === TokenType.L_BRACKET && terminator !== TokenType.L_BRACKET)
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
                else if (token.type === terminator && openParens === 0 && openBraces === 0 && openBrackets === 0) {
                    if (includeTerminator)
                        statementTokens.push(token);
                    //if (consumeTerminator && token.type !== TokenType.SEMICOLON)
                    if ((includeTerminator || consumeTerminator) && token.type !== TokenType.SEMICOLON)
                        tokens.shift(); // Consume end of block
                    break;
                }
                else if (token.type === terminator && (openParens > 0 || openBraces > 0 || openBrackets > 0)) {
                }
                else {
                    if (validIfTerminatorNotFound)
                        break;
                    throw Error("Invalid syntax, expecting " + terminator + ".");
                }
            }
            statementTokens.push(token);
            tokens.shift(); // Consume part of statement
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
    Tree.apply = function (code, scope, dom, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var t;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        t = new Tree(code);
                        return [4 /*yield*/, t.evaluate(scope, dom, tag)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Tree.cache = {};
    return Tree;
}());
exports.Tree = Tree;
//# sourceMappingURL=AST.js.map