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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeMemberNode = void 0;
var Scope_1 = require("../Scope");
var TagList_1 = require("../Tag/TagList");
var DOMObject_1 = require("../DOM/DOMObject");
var ElementQueryNode_1 = require("./ElementQueryNode");
var ScopeNodeAbstract_1 = require("./ScopeNodeAbstract");
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
            var scopes, values, elements, evalScope, _i, scopes_1, parent_1, _a, _b, name_1, value;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        scopes = [];
                        values = [];
                        if (!(this.scope instanceof ElementQueryNode_1.ElementQueryNode)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.scope.evaluate(scope, dom, tag)];
                    case 1:
                        elements = _c.sent();
                        if (this.scope.first) {
                            scopes.push(elements);
                        }
                        else {
                            scopes = elements;
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.scope.evaluate(scope, dom, tag)];
                    case 3:
                        evalScope = _c.sent();
                        if (evalScope instanceof TagList_1.TagList) {
                            scopes = evalScope;
                        }
                        else {
                            scopes.push(evalScope);
                        }
                        _c.label = 4;
                    case 4:
                        _i = 0, scopes_1 = scopes;
                        _c.label = 5;
                    case 5:
                        if (!(_i < scopes_1.length)) return [3 /*break*/, 11];
                        parent_1 = scopes_1[_i];
                        if (parent_1 instanceof DOMObject_1.DOMObject)
                            parent_1 = parent_1.scope;
                        if (!!parent_1) return [3 /*break*/, 7];
                        _a = Error;
                        _b = "Cannot access \"";
                        return [4 /*yield*/, this.name.evaluate(scope, dom, tag)];
                    case 6: throw _a.apply(void 0, [_b + (_c.sent()) + "\" of undefined."]);
                    case 7: return [4 /*yield*/, this.name.evaluate(scope, dom, tag)];
                    case 8:
                        name_1 = _c.sent();
                        return [4 /*yield*/, this.applyModifiers(name_1, parent_1, dom, tag)];
                    case 9:
                        _c.sent();
                        value = parent_1.get(name_1, false);
                        values.push(value instanceof Scope_1.Scope && value.wrapped || value);
                        _c.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 5];
                    case 11: return [2 /*return*/, values.length === 1 ? values[0] : values];
                }
            });
        });
    };
    return ScopeMemberNode;
}(ScopeNodeAbstract_1.ScopeNodeAbstract));
exports.ScopeMemberNode = ScopeMemberNode;
//# sourceMappingURL=ScopeMemberNode.js.map