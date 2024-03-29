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
exports.ElementAttributeNode = void 0;
var TagList_1 = require("../Tag/TagList");
var Node_1 = require("./Node");
var ElementQueryNode_1 = require("./ElementQueryNode");
var LiteralNode_1 = require("./LiteralNode");
var DOMObject_1 = require("../DOM/DOMObject");
var IndexNode_1 = require("./IndexNode");
var ScopeMemberNode_1 = require("./ScopeMemberNode");
var RootScopeMemberNode_1 = require("./RootScopeMemberNode");
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
            return new LiteralNode_1.LiteralNode("@" + this.attributeName);
        },
        enumerable: false,
        configurable: true
    });
    ElementAttributeNode.prototype._getChildNodes = function () {
        var nodes = [];
        if (this.elementRef)
            nodes.push(this.elementRef);
        return nodes;
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
    ElementAttributeNode.prototype._evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tags, indexResult, scopeEval;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.elementRef instanceof ElementQueryNode_1.ElementQueryNode)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.elementRef.evaluate(scope, dom, tag, true)];
                    case 1:
                        tags = _a.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        if (!(this.elementRef instanceof IndexNode_1.IndexNode)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.elementRef.evaluate(scope, dom, tag, true)];
                    case 3:
                        indexResult = _a.sent();
                        if (indexResult instanceof TagList_1.TagList) {
                            tags = indexResult;
                        }
                        else {
                            tags = new TagList_1.TagList(indexResult);
                        }
                        return [3 /*break*/, 7];
                    case 4:
                        if (!(this.elementRef instanceof ScopeMemberNode_1.ScopeMemberNode || this.elementRef instanceof RootScopeMemberNode_1.RootScopeMemberNode)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.elementRef.evaluate(scope, dom, tag, true)];
                    case 5:
                        scopeEval = _a.sent();
                        if (Array.isArray(scopeEval)) {
                            tags = scopeEval;
                        }
                        else {
                            tags = new TagList_1.TagList(scopeEval);
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        if (tag) {
                            tags = new TagList_1.TagList(tag);
                        }
                        else {
                            return [2 /*return*/];
                        }
                        _a.label = 7;
                    case 7:
                        if (tags.length === 1) {
                            return [2 /*return*/, this.getAttributeScopeValue(tags[0])];
                        }
                        return [2 /*return*/, tags.map(function (tag) { return _this.getAttributeScopeValue(tag); })];
                }
            });
        });
    };
    ElementAttributeNode.prototype.getAttributeScopeValue = function (tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(tag instanceof DOMObject_1.DOMObject)) {
                            return [2 /*return*/, ''];
                        }
                        // Make sure the attribute is being watched
                        return [4 /*yield*/, tag.watchAttribute(this.attributeName)];
                    case 1:
                        // Make sure the attribute is being watched
                        _a.sent();
                        return [2 /*return*/, tag.scope.get("@" + this.attributeName)];
                }
            });
        });
    };
    ElementAttributeNode.prototype.prepare = function (scope, dom, tag, meta) {
        if (tag === void 0) { tag = null; }
        if (meta === void 0) { meta = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tags, tags_1, tags_1_1, t, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.elementRef) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.elementRef.prepare(scope, dom, tag, meta)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.elementRef.evaluate(scope, dom, tag, true)];
                    case 2:
                        tags = _b.sent();
                        if (!(tags instanceof TagList_1.TagList)) return [3 /*break*/, 11];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 8, 9, 10]);
                        tags_1 = __values(tags), tags_1_1 = tags_1.next();
                        _b.label = 4;
                    case 4:
                        if (!!tags_1_1.done) return [3 /*break*/, 7];
                        t = tags_1_1.value;
                        return [4 /*yield*/, (t === null || t === void 0 ? void 0 : t.watchAttribute(this.attributeName))];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        tags_1_1 = tags_1.next();
                        return [3 /*break*/, 4];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        if (!(tags instanceof DOMObject_1.DOMObject)) return [3 /*break*/, 13];
                        return [4 /*yield*/, tags.watchAttribute(this.attributeName)];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13: return [3 /*break*/, 16];
                    case 14:
                        if (!tag) return [3 /*break*/, 16];
                        return [4 /*yield*/, tag.watchAttribute(this.attributeName)];
                    case 15:
                        _b.sent();
                        _b.label = 16;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return ElementAttributeNode;
}(Node_1.Node));
exports.ElementAttributeNode = ElementAttributeNode;
//# sourceMappingURL=ElementAttributeNode.js.map