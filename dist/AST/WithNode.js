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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithNode = void 0;
var Scope_1 = require("../Scope");
var Tag_1 = require("../Tag");
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var TagList_1 = require("../Tag/TagList");
var WithNode = /** @class */ (function (_super) {
    __extends(WithNode, _super);
    function WithNode(context, statements) {
        var _this = _super.call(this) || this;
        _this.context = context;
        _this.statements = statements;
        _this.requiresPrep = true;
        return _this;
    }
    WithNode.prototype._getChildNodes = function () {
        return [
            this.context,
            this.statements
        ];
    };
    WithNode.prototype._evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var context, tags, ret, tags_1, tags_1_1, _tag, _a, _b, e_1_1, promises, tags_2, tags_2_1, _tag, e_2_1, _scope, _c, _d;
            var e_1, _e, e_2, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.context.evaluate(scope, dom, tag)];
                    case 1:
                        context = _g.sent();
                        tags = [];
                        if (context instanceof TagList_1.TagList) {
                            tags = context;
                        }
                        else if (context instanceof Tag_1.Tag) {
                            tags = [context];
                        }
                        ret = [];
                        if (!tags.length) return [3 /*break*/, 22];
                        if (!this.hasModifier('sequential')) return [3 /*break*/, 11];
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 8, 9, 10]);
                        tags_1 = __values(tags), tags_1_1 = tags_1.next();
                        _g.label = 3;
                    case 3:
                        if (!!tags_1_1.done) return [3 /*break*/, 7];
                        _tag = tags_1_1.value;
                        return [4 /*yield*/, this.statements.prepare(_tag.scope, dom, _tag)];
                    case 4:
                        _g.sent();
                        _b = (_a = ret).push;
                        return [4 /*yield*/, this.statements.evaluate(_tag.scope, dom, _tag)];
                    case 5:
                        _b.apply(_a, [_g.sent()]);
                        _g.label = 6;
                    case 6:
                        tags_1_1 = tags_1.next();
                        return [3 /*break*/, 3];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (tags_1_1 && !tags_1_1.done && (_e = tags_1.return)) _e.call(tags_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10: return [3 /*break*/, 21];
                    case 11:
                        promises = [];
                        _g.label = 12;
                    case 12:
                        _g.trys.push([12, 17, 18, 19]);
                        tags_2 = __values(tags), tags_2_1 = tags_2.next();
                        _g.label = 13;
                    case 13:
                        if (!!tags_2_1.done) return [3 /*break*/, 16];
                        _tag = tags_2_1.value;
                        return [4 /*yield*/, this.statements.prepare(_tag.scope, dom, _tag)];
                    case 14:
                        _g.sent();
                        promises.push(this.statements.evaluate(_tag.scope, dom, _tag));
                        _g.label = 15;
                    case 15:
                        tags_2_1 = tags_2.next();
                        return [3 /*break*/, 13];
                    case 16: return [3 /*break*/, 19];
                    case 17:
                        e_2_1 = _g.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 19];
                    case 18:
                        try {
                            if (tags_2_1 && !tags_2_1.done && (_f = tags_2.return)) _f.call(tags_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 19: return [4 /*yield*/, Promise.all(promises)];
                    case 20:
                        ret = _g.sent();
                        _g.label = 21;
                    case 21: return [3 /*break*/, 24];
                    case 22:
                        _scope = void 0;
                        if (context instanceof Scope_1.Scope) {
                            _scope = context;
                        }
                        if (!_scope) return [3 /*break*/, 24];
                        _d = (_c = ret).push;
                        return [4 /*yield*/, this.statements.evaluate(_scope, dom, tag)];
                    case 23:
                        _d.apply(_c, [_g.sent()]);
                        _g.label = 24;
                    case 24: return [2 /*return*/, ret.length === 1 ? ret[0] : ret];
                }
            });
        });
    };
    WithNode.parse = function (lastNode, token, tokens) {
        tokens.shift(); // Consume with
        var contextTokens = AST_1.Tree.getTokensUntil(tokens, AST_1.TokenType.L_BRACE, false, false, true);
        var statementTokens = AST_1.Tree.getNextStatementTokens(tokens);
        this.moveModifiers(contextTokens, tokens);
        return new WithNode(AST_1.Tree.processTokens(contextTokens), AST_1.Tree.processTokens(statementTokens));
    };
    return WithNode;
}(Node_1.Node));
exports.WithNode = WithNode;
//# sourceMappingURL=WithNode.js.map