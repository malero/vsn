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
exports.DispatchEventNode = void 0;
var Scope_1 = require("../Scope");
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var ScopeData_1 = require("../Scope/ScopeData");
var ElementQueryNode_1 = require("./ElementQueryNode");
var DispatchEventNode = /** @class */ (function (_super) {
    __extends(DispatchEventNode, _super);
    function DispatchEventNode(name, data, bubbles, elementRef) {
        if (bubbles === void 0) { bubbles = false; }
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.data = data;
        _this.bubbles = bubbles;
        _this.elementRef = elementRef;
        return _this;
    }
    DispatchEventNode.prototype._getChildNodes = function () {
        var nodes = [];
        if (this.data)
            nodes.push(this.data);
        return nodes;
    };
    DispatchEventNode.prototype._evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var detail, _a, targets, targets_1, targets_1_1, target;
            var e_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.data) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.data.evaluate(scope, dom, tag)];
                    case 1:
                        _a = (_c.sent()).objectify;
                        return [3 /*break*/, 3];
                    case 2:
                        _a = {};
                        _c.label = 3;
                    case 3:
                        detail = _a;
                        if (detail instanceof Scope_1.Scope)
                            detail = detail.data.getData();
                        else if (detail instanceof ScopeData_1.ScopeData)
                            detail = detail.getData();
                        targets = [tag];
                        if (!this.elementRef) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.elementRef.evaluate(scope, dom, tag, true)];
                    case 4:
                        targets = _c.sent();
                        _c.label = 5;
                    case 5:
                        try {
                            for (targets_1 = __values(targets), targets_1_1 = targets_1.next(); !targets_1_1.done; targets_1_1 = targets_1.next()) {
                                target = targets_1_1.value;
                                detail['source'] = target.element;
                                target.element.dispatchEvent(new CustomEvent(this.name, {
                                    bubbles: this.bubbles,
                                    detail: detail
                                }));
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (targets_1_1 && !targets_1_1.done && (_b = targets_1.return)) _b.call(targets_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DispatchEventNode.parse = function (lastNode, token, tokens) {
        var name = tokens.shift();
        var data = null;
        if (tokens.length && tokens[0].type === AST_1.TokenType.L_BRACE) {
            var containedTokens = AST_1.Tree.getNextStatementTokens(tokens, false, false, true);
            data = AST_1.Tree.processTokens(containedTokens).statements[0];
        }
        var elementRef = lastNode instanceof ElementQueryNode_1.ElementQueryNode ? lastNode : null;
        return new DispatchEventNode(name.value, data, name.full.startsWith('!!!'), elementRef);
    };
    return DispatchEventNode;
}(Node_1.Node));
exports.DispatchEventNode = DispatchEventNode;
//# sourceMappingURL=DispatchEventNode.js.map