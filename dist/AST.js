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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = exports.TreeCache = exports.AttributableNodes = exports.tokenIsBlockCloser = exports.tokenIsBlockOpener = exports.getTokenBlockOpenerConfig = exports.BlockCloseToTypeMap = exports.BlockOpenToTypeMap = exports.BlockTypeConfigurations = exports.TokenType = exports.BlockType = void 0;
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
var LoopNode_1 = require("./AST/LoopNode");
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
    TokenType[TokenType["TYPE_BOOL"] = 6] = "TYPE_BOOL";
    TokenType[TokenType["RETURN"] = 7] = "RETURN";
    TokenType[TokenType["NOT"] = 8] = "NOT";
    TokenType[TokenType["OF"] = 9] = "OF";
    TokenType[TokenType["AS"] = 10] = "AS";
    TokenType[TokenType["IN"] = 11] = "IN";
    TokenType[TokenType["WITH"] = 12] = "WITH";
    TokenType[TokenType["NAMED_STACK"] = 13] = "NAMED_STACK";
    TokenType[TokenType["FOR"] = 14] = "FOR";
    TokenType[TokenType["IF"] = 15] = "IF";
    TokenType[TokenType["ELSE_IF"] = 16] = "ELSE_IF";
    TokenType[TokenType["ELSE"] = 17] = "ELSE";
    TokenType[TokenType["FUNC"] = 18] = "FUNC";
    TokenType[TokenType["LOOP"] = 19] = "LOOP";
    TokenType[TokenType["ON"] = 20] = "ON";
    TokenType[TokenType["CLASS"] = 21] = "CLASS";
    TokenType[TokenType["NAME"] = 22] = "NAME";
    TokenType[TokenType["L_BRACE"] = 23] = "L_BRACE";
    TokenType[TokenType["R_BRACE"] = 24] = "R_BRACE";
    TokenType[TokenType["L_BRACKET"] = 25] = "L_BRACKET";
    TokenType[TokenType["R_BRACKET"] = 26] = "R_BRACKET";
    TokenType[TokenType["L_PAREN"] = 27] = "L_PAREN";
    TokenType[TokenType["R_PAREN"] = 28] = "R_PAREN";
    TokenType[TokenType["TILDE"] = 29] = "TILDE";
    TokenType[TokenType["PERIOD"] = 30] = "PERIOD";
    TokenType[TokenType["COMMA"] = 31] = "COMMA";
    TokenType[TokenType["COLON"] = 32] = "COLON";
    TokenType[TokenType["SEMICOLON"] = 33] = "SEMICOLON";
    TokenType[TokenType["STRING_FORMAT"] = 34] = "STRING_FORMAT";
    TokenType[TokenType["STRING_LITERAL"] = 35] = "STRING_LITERAL";
    TokenType[TokenType["NUMBER_LITERAL"] = 36] = "NUMBER_LITERAL";
    TokenType[TokenType["BOOLEAN_LITERAL"] = 37] = "BOOLEAN_LITERAL";
    TokenType[TokenType["NULL_LITERAL"] = 38] = "NULL_LITERAL";
    TokenType[TokenType["STRICT_EQUALS"] = 39] = "STRICT_EQUALS";
    TokenType[TokenType["STRICT_NOT_EQUALS"] = 40] = "STRICT_NOT_EQUALS";
    TokenType[TokenType["EQUALS"] = 41] = "EQUALS";
    TokenType[TokenType["NOT_EQUALS"] = 42] = "NOT_EQUALS";
    TokenType[TokenType["GREATER_THAN_EQUAL"] = 43] = "GREATER_THAN_EQUAL";
    TokenType[TokenType["LESS_THAN_EQUAL"] = 44] = "LESS_THAN_EQUAL";
    TokenType[TokenType["GREATER_THAN"] = 45] = "GREATER_THAN";
    TokenType[TokenType["LESS_THAN"] = 46] = "LESS_THAN";
    TokenType[TokenType["ASSIGN"] = 47] = "ASSIGN";
    TokenType[TokenType["AND"] = 48] = "AND";
    TokenType[TokenType["OR"] = 49] = "OR";
    TokenType[TokenType["ADD"] = 50] = "ADD";
    TokenType[TokenType["SUBTRACT"] = 51] = "SUBTRACT";
    TokenType[TokenType["MULTIPLY"] = 52] = "MULTIPLY";
    TokenType[TokenType["DIVIDE"] = 53] = "DIVIDE";
    TokenType[TokenType["ADD_ASSIGN"] = 54] = "ADD_ASSIGN";
    TokenType[TokenType["SUBTRACT_ASSIGN"] = 55] = "SUBTRACT_ASSIGN";
    TokenType[TokenType["MULTIPLY_ASSIGN"] = 56] = "MULTIPLY_ASSIGN";
    TokenType[TokenType["DIVIDE_ASSIGN"] = 57] = "DIVIDE_ASSIGN";
    TokenType[TokenType["EXCLAMATION_POINT"] = 58] = "EXCLAMATION_POINT";
    TokenType[TokenType["ELEMENT_REFERENCE"] = 59] = "ELEMENT_REFERENCE";
    TokenType[TokenType["ELEMENT_ATTRIBUTE"] = 60] = "ELEMENT_ATTRIBUTE";
    TokenType[TokenType["ELEMENT_STYLE"] = 61] = "ELEMENT_STYLE";
    TokenType[TokenType["ELEMENT_QUERY"] = 62] = "ELEMENT_QUERY";
    TokenType[TokenType["UNIT"] = 63] = "UNIT";
    TokenType[TokenType["XHR_GET"] = 64] = "XHR_GET";
    TokenType[TokenType["XHR_POST"] = 65] = "XHR_POST";
    TokenType[TokenType["XHR_PUT"] = 66] = "XHR_PUT";
    TokenType[TokenType["XHR_DELETE"] = 67] = "XHR_DELETE";
    TokenType[TokenType["MODIFIER"] = 68] = "MODIFIER";
    TokenType[TokenType["DISPATCH_EVENT"] = 69] = "DISPATCH_EVENT";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
exports.BlockTypeConfigurations = (_a = {},
    _a[BlockType.BRACE] = {
        open: TokenType.L_BRACE,
        close: TokenType.R_BRACE,
    },
    _a[BlockType.BRACKET] = {
        open: TokenType.L_BRACKET,
        close: TokenType.R_BRACKET,
    },
    _a[BlockType.PAREN] = {
        open: TokenType.L_PAREN,
        close: TokenType.R_PAREN,
    },
    _a);
exports.BlockOpenToTypeMap = (_b = {},
    _b[TokenType.L_BRACE] = BlockType.BRACE,
    _b[TokenType.L_BRACKET] = BlockType.BRACKET,
    _b[TokenType.L_PAREN] = BlockType.PAREN,
    _b);
exports.BlockCloseToTypeMap = (_c = {},
    _c[TokenType.R_BRACE] = BlockType.BRACE,
    _c[TokenType.R_BRACKET] = BlockType.BRACKET,
    _c[TokenType.R_PAREN] = BlockType.PAREN,
    _c);
function getTokenBlockOpenerConfig(opener) {
    return exports.BlockTypeConfigurations[exports.BlockOpenToTypeMap[opener]];
}
exports.getTokenBlockOpenerConfig = getTokenBlockOpenerConfig;
function tokenIsBlockOpener(token) {
    return exports.BlockOpenToTypeMap[token] !== undefined;
}
exports.tokenIsBlockOpener = tokenIsBlockOpener;
function tokenIsBlockCloser(token) {
    return exports.BlockCloseToTypeMap[token] !== undefined;
}
exports.tokenIsBlockCloser = tokenIsBlockCloser;
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
        pattern: /^int\s/
    },
    {
        type: TokenType.TYPE_UINT,
        pattern: /^uint\s/
    },
    {
        type: TokenType.TYPE_FLOAT,
        pattern: /^float\s/
    },
    {
        type: TokenType.TYPE_BOOL,
        pattern: /^bool\s/
    },
    {
        type: TokenType.UNIT,
        pattern: /^\d+\.?\d?(?:cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)/
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
        type: TokenType.LOOP,
        pattern: /^loop\s/
    },
    {
        type: TokenType.ON,
        pattern: /^on\s/
    },
    {
        type: TokenType.CLASS,
        pattern: /^class\s([^{]+)/
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
        pattern: /^\|[a-zA-Z0-9,]+/
    }
];
exports.AttributableNodes = [
    RootScopeMemberNode_1.RootScopeMemberNode,
    ScopeMemberNode_1.ScopeMemberNode,
    ElementAttributeNode_1.ElementAttributeNode
];
var TreeCache = /** @class */ (function () {
    function TreeCache() {
        this.cache = new Map();
        this.lastUsed = new Map();
    }
    TreeCache.prototype.get = function (code) {
        if (!this.cache.has(code))
            return null;
        this.lastUsed.set(code, Date.now());
        return this.cache.get(code);
    };
    TreeCache.prototype.set = function (code, node) {
        var e_1, _a;
        this.cache.set(code, node);
        this.lastUsed.set(code, Date.now());
        if (this.cache.size > 200) {
            var toRemove = 20;
            try {
                for (var _b = __values(Array.from(this.lastUsed.entries()).sort(function (a, b) { return a[1] - b[1]; })), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], lastUsed = _d[1];
                    this.cache.delete(key);
                    this.lastUsed.delete(key);
                    toRemove--;
                    if (toRemove === 0)
                        break;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    TreeCache.prototype.has = function (code) {
        return this.cache.has(code);
    };
    return TreeCache;
}());
exports.TreeCache = TreeCache;
var Tree = /** @class */ (function () {
    function Tree(code) {
        this.code = code;
        if (Tree.cache.has(code)) {
            this._root = Tree.cache.get(code);
        }
        else {
            this.parse();
            Tree.cache.set(code, this._root);
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
            var context, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = {
                            scope: scope,
                            dom: dom,
                            tag: tag,
                            tree: this
                        };
                        Tree.executing.add(context);
                        return [4 /*yield*/, this._root.evaluate(scope, dom, tag)];
                    case 1:
                        r = _a.sent();
                        Tree.executing.delete(context);
                        return [2 /*return*/, r];
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
            var _a, _b, node, _scope, name_1, e_2_1;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, 10, 11]);
                        _a = __values(this._root.findChildrenByTypes([RootScopeMemberNode_1.RootScopeMemberNode, ScopeMemberNode_1.ScopeMemberNode, ElementAttributeNode_1.ElementAttributeNode], 'ScopeMemberNodes')), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 8];
                        node = _b.value;
                        _scope = scope;
                        if (!(node instanceof ScopeMemberNode_1.ScopeMemberNode)) return [3 /*break*/, 3];
                        return [4 /*yield*/, node.scope.evaluate(scope, dom)];
                    case 2:
                        _scope = _d.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(node instanceof ElementAttributeNode_1.ElementAttributeNode && node.elementRef)) return [3 /*break*/, 5];
                        return [4 /*yield*/, node.elementRef.evaluate(scope, dom, tag)];
                    case 4:
                        _scope = (_d.sent())[0].scope;
                        _d.label = 5;
                    case 5: return [4 /*yield*/, node.name.evaluate(scope, dom, tag)];
                    case 6:
                        name_1 = _d.sent();
                        _scope.on("change:" + name_1, fnc);
                        _d.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Tree.reprepareExecutingTrees = function () {
        var _this = this;
        Tree.executing.forEach(function (context) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, context.tree.prepare(context.scope, context.dom, context.tag)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Tree.tokenize = function (code) {
        var e_3, _a;
        var tokens = [];
        if (!code || code.length === 0)
            return tokens;
        var foundToken;
        do {
            foundToken = false;
            try {
                for (var TOKEN_PATTERNS_1 = (e_3 = void 0, __values(TOKEN_PATTERNS)), TOKEN_PATTERNS_1_1 = TOKEN_PATTERNS_1.next(); !TOKEN_PATTERNS_1_1.done; TOKEN_PATTERNS_1_1 = TOKEN_PATTERNS_1.next()) {
                    var tp = TOKEN_PATTERNS_1_1.value;
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
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (TOKEN_PATTERNS_1_1 && !TOKEN_PATTERNS_1_1.done && (_a = TOKEN_PATTERNS_1.return)) _a.call(TOKEN_PATTERNS_1);
                }
                finally { if (e_3) throw e_3.error; }
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
        var e_4, _a;
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
            else if (token.type === TokenType.LOOP) {
                node = LoopNode_1.LoopNode.parse(node, token, tokens);
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
                try {
                    for (var funcArgs_1 = (e_4 = void 0, __values(funcArgs)), funcArgs_1_1 = funcArgs_1.next(); !funcArgs_1_1.done; funcArgs_1_1 = funcArgs_1.next()) {
                        var arg = funcArgs_1_1.value;
                        nodes.push(Tree.processTokens(arg));
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (funcArgs_1_1 && !funcArgs_1_1.done && (_a = funcArgs_1.return)) _a.call(funcArgs_1);
                    }
                    finally { if (e_4) throw e_4.error; }
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
        var args = [];
        var arg = [];
        var isOpen = true;
        // consume opener
        tokens.shift();
        while (isOpen) {
            var token = tokens[0];
            if (token === undefined)
                throw Error("Invalid Syntax, missing " + blockInfo.closeCharacter);
            if (token.type === blockInfo.close) {
                isOpen = false;
                tokens.shift();
                //arg.push(token);
            }
            else if (tokenIsBlockOpener(token.type)) {
                var opener_1 = tokens.shift();
                var innerBlock = Tree.getTokensUntil(tokens, getTokenBlockOpenerConfig(token.type).close, true, true);
                innerBlock.unshift(opener_1);
                arg.push.apply(arg, __spreadArray([], __read(innerBlock)));
                //args.push(innerBlock);
            }
            else if (groupBy !== null && token.type === groupBy) {
                args.push(arg);
                arg = [];
                tokens.shift();
            }
            else if (token.type !== TokenType.WHITESPACE) {
                arg.push(tokens.shift());
            }
        }
        if (arg.length > 0)
            args.push(arg);
        return args;
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
        var e_5, _a;
        var matching = [];
        try {
            for (var tokens_1 = __values(tokens), tokens_1_1 = tokens_1.next(); !tokens_1_1.done; tokens_1_1 = tokens_1.next()) {
                var token = tokens_1_1.value;
                if (types.indexOf(token.type) > -1) {
                    matching.push(token);
                }
                else {
                    break;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (tokens_1_1 && !tokens_1_1.done && (_a = tokens_1.return)) _a.call(tokens_1);
            }
            finally { if (e_5) throw e_5.error; }
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
    Tree.executing = new Set();
    Tree.cache = new TreeCache();
    return Tree;
}());
exports.Tree = Tree;
//# sourceMappingURL=AST.js.map