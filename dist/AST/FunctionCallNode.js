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
exports.FunctionCallNode = void 0;
var Tag_1 = require("../Tag");
var Node_1 = require("./Node");
var ScopeMemberNode_1 = require("./ScopeMemberNode");
var FunctionNode_1 = require("./FunctionNode");
var ElementQueryNode_1 = require("./ElementQueryNode");
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
    FunctionCallNode.prototype.callFunction = function (func, functionScope, dom, tag) {
        var values = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            values[_i - 4] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(func instanceof FunctionNode_1.FunctionNode)) return [3 /*break*/, 4];
                        return [4 /*yield*/, func.evaluate(functionScope, dom, tag)];
                    case 1: return [4 /*yield*/, (_a.sent()).apply(void 0, __spreadArray([], __read(values)))];
                    case 2:
                        r = _a.sent();
                        return [4 /*yield*/, func.collectGarbage()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, [r, true]];
                    case 4:
                        if (typeof func === 'function') {
                            return [2 /*return*/, [func.call.apply(func, __spreadArray([functionScope.wrapped || functionScope], __read(values))), true]];
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/, [null, false]];
                }
            });
        });
    };
    FunctionCallNode.prototype._evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tags, functionScope, _tags, values, functionName, returnValues, calls, func, _functionScope, tags_1, tags_1_1, _tag, _a, result, success, e_1_1;
            var e_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        tags = [];
                        functionScope = scope;
                        if (!(this.fnc instanceof ScopeMemberNode_1.ScopeMemberNode)) return [3 /*break*/, 4];
                        if (!(this.fnc.scope instanceof ElementQueryNode_1.ElementQueryNode)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fnc.scope.evaluate(scope, dom, tag)];
                    case 1:
                        _tags = _c.sent();
                        if (_tags instanceof Array) {
                            tags = _tags;
                        }
                        else if (_tags instanceof Tag_1.Tag) {
                            tags = [_tags];
                            functionScope = _tags.scope;
                        }
                        else {
                            throw new Error('Invalid element query result');
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.fnc.scope.evaluate(scope, dom, tag)];
                    case 3:
                        functionScope = _c.sent();
                        _c.label = 4;
                    case 4:
                        if (tags.length === 0)
                            tags.push(tag);
                        return [4 /*yield*/, this.args.evaluate(scope, dom, tag)];
                    case 5:
                        values = _c.sent();
                        return [4 /*yield*/, this.fnc.name.evaluate(scope, dom, tag)];
                    case 6:
                        functionName = _c.sent();
                        returnValues = [];
                        calls = 0;
                        _functionScope = functionScope;
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 15, 16, 17]);
                        tags_1 = __values(tags), tags_1_1 = tags_1.next();
                        _c.label = 8;
                    case 8:
                        if (!!tags_1_1.done) return [3 /*break*/, 14];
                        _tag = tags_1_1.value;
                        if (_tag === null) {
                            _functionScope = functionScope;
                        }
                        else {
                            _functionScope = _tag.scope;
                        }
                        if (!_functionScope.has(functionName)) return [3 /*break*/, 9];
                        func = _functionScope.get(functionName);
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.fnc.evaluate(scope, dom, _tag)];
                    case 10:
                        func = _c.sent();
                        _c.label = 11;
                    case 11: return [4 /*yield*/, this.callFunction.apply(this, __spreadArray([func, _functionScope, dom, _tag], __read(values)))];
                    case 12:
                        _a = __read.apply(void 0, [_c.sent(), 2]), result = _a[0], success = _a[1];
                        if (success) {
                            returnValues.push(result);
                            calls++;
                        }
                        else {
                            console.warn("Function " + functionName + " was not found in current scope.");
                        }
                        _c.label = 13;
                    case 13:
                        tags_1_1 = tags_1.next();
                        return [3 /*break*/, 8];
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        e_1_1 = _c.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 17];
                    case 16:
                        try {
                            if (tags_1_1 && !tags_1_1.done && (_b = tags_1.return)) _b.call(tags_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 17:
                        if (calls === 1) {
                            return [2 /*return*/, returnValues[0]];
                        }
                        else if (calls === 0) {
                            throw new Error("Function " + functionName + " not found");
                        }
                        else {
                            return [2 /*return*/, returnValues];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return FunctionCallNode;
}(Node_1.Node));
exports.FunctionCallNode = FunctionCallNode;
//# sourceMappingURL=FunctionCallNode.js.map