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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionCallNode = void 0;
var Tag_1 = require("../Tag");
var Node_1 = require("./Node");
var ScopeMemberNode_1 = require("./ScopeMemberNode");
var FunctionNode_1 = require("./FunctionNode");
var Registry_1 = require("../Registry");
var ElementQueryNode_1 = require("./ElementQueryNode");
var ClassNode_1 = require("./ClassNode");
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
            var tags, functionScope, functionName, instanceOfScopeMemberNode, _tags, values, func, functionName_1, returnValues, toCleanup, calls, tags_1, tags_1_1, _tag, tagNum, _a, _b, className, cls, fnc, _c, _d, e_1_1, e_2_1, toCleanup_1, toCleanup_1_1, fnc, e_3_1, r;
            var e_2, _e, e_1, _f, e_3, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        tags = [];
                        functionScope = scope;
                        functionName = '';
                        instanceOfScopeMemberNode = false;
                        if (!(this.fnc instanceof ScopeMemberNode_1.ScopeMemberNode)) return [3 /*break*/, 5];
                        instanceOfScopeMemberNode = true;
                        return [4 /*yield*/, this.fnc.scope.evaluate(scope, dom, tag)];
                    case 1:
                        functionScope = _h.sent();
                        return [4 /*yield*/, this.fnc.name.evaluate(scope, dom, tag)];
                    case 2:
                        functionName = _h.sent();
                        if (!(this.fnc.scope instanceof ElementQueryNode_1.ElementQueryNode)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.fnc.scope.evaluate(scope, dom, tag)];
                    case 3:
                        _tags = _h.sent();
                        if (_tags instanceof Array) {
                            tags = _tags;
                        }
                        else if (_tags instanceof Tag_1.Tag) {
                            tags = [_tags];
                        }
                        else {
                            throw new Error('Invalid element query result');
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        tags = [tag];
                        _h.label = 5;
                    case 5: return [4 /*yield*/, this.args.evaluate(scope, dom, tag)];
                    case 6:
                        values = _h.sent();
                        return [4 /*yield*/, this.fnc.evaluate(scope, dom, tag)];
                    case 7:
                        func = _h.sent();
                        if (!(!func || func instanceof Array)) return [3 /*break*/, 31];
                        return [4 /*yield*/, this.fnc.name.evaluate(scope, dom, tag)];
                    case 8:
                        functionName_1 = _h.sent();
                        returnValues = [];
                        toCleanup = [];
                        calls = 0;
                        _h.label = 9;
                    case 9:
                        _h.trys.push([9, 21, 22, 23]);
                        tags_1 = __values(tags), tags_1_1 = tags_1.next();
                        _h.label = 10;
                    case 10:
                        if (!!tags_1_1.done) return [3 /*break*/, 20];
                        _tag = tags_1_1.value;
                        tagNum = 0;
                        _h.label = 11;
                    case 11:
                        _h.trys.push([11, 17, 18, 19]);
                        _a = (e_1 = void 0, __values(_tag.element[ClassNode_1.ClassNode.ClassesVariable] || [])), _b = _a.next();
                        _h.label = 12;
                    case 12:
                        if (!!_b.done) return [3 /*break*/, 16];
                        className = _b.value;
                        tagNum++;
                        cls = Registry_1.Registry.instance.classes.getSynchronous(className);
                        if (!cls) return [3 /*break*/, 15];
                        if (!cls.classScope.has(functionName_1)) return [3 /*break*/, 15];
                        fnc = cls.classScope.get(functionName_1);
                        toCleanup.push(fnc);
                        _d = (_c = returnValues).push;
                        return [4 /*yield*/, fnc.evaluate(_tag.scope, dom, _tag)];
                    case 13: return [4 /*yield*/, (_h.sent()).apply(void 0, __spreadArray([], __read(values)))];
                    case 14:
                        _d.apply(_c, [_h.sent()]);
                        calls++;
                        _h.label = 15;
                    case 15:
                        _b = _a.next();
                        return [3 /*break*/, 12];
                    case 16: return [3 /*break*/, 19];
                    case 17:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 19];
                    case 18:
                        try {
                            if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 19:
                        tags_1_1 = tags_1.next();
                        return [3 /*break*/, 10];
                    case 20: return [3 /*break*/, 23];
                    case 21:
                        e_2_1 = _h.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 23];
                    case 22:
                        try {
                            if (tags_1_1 && !tags_1_1.done && (_e = tags_1.return)) _e.call(tags_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 23:
                        _h.trys.push([23, 28, 29, 30]);
                        toCleanup_1 = __values(toCleanup), toCleanup_1_1 = toCleanup_1.next();
                        _h.label = 24;
                    case 24:
                        if (!!toCleanup_1_1.done) return [3 /*break*/, 27];
                        fnc = toCleanup_1_1.value;
                        return [4 /*yield*/, fnc.collectGarbage()];
                    case 25:
                        _h.sent();
                        _h.label = 26;
                    case 26:
                        toCleanup_1_1 = toCleanup_1.next();
                        return [3 /*break*/, 24];
                    case 27: return [3 /*break*/, 30];
                    case 28:
                        e_3_1 = _h.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 30];
                    case 29:
                        try {
                            if (toCleanup_1_1 && !toCleanup_1_1.done && (_g = toCleanup_1.return)) _g.call(toCleanup_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 30:
                        if (calls === 1) {
                            return [2 /*return*/, returnValues[0]];
                        }
                        else if (calls === 0) {
                            throw new Error("Function " + functionName_1 + " not found");
                        }
                        else {
                            return [2 /*return*/, returnValues];
                        }
                        return [3 /*break*/, 36];
                    case 31:
                        if (!(func instanceof FunctionNode_1.FunctionNode)) return [3 /*break*/, 35];
                        return [4 /*yield*/, func.evaluate(functionScope, dom, tag)];
                    case 32: return [4 /*yield*/, (_h.sent()).apply(void 0, __spreadArray([], __read(values)))];
                    case 33:
                        r = _h.sent();
                        return [4 /*yield*/, func.collectGarbage()];
                    case 34:
                        _h.sent();
                        return [2 /*return*/, r];
                    case 35: return [2 /*return*/, func.call.apply(func, __spreadArray([functionScope.wrapped || functionScope], __read(values)))];
                    case 36: return [2 /*return*/];
                }
            });
        });
    };
    return FunctionCallNode;
}(Node_1.Node));
exports.FunctionCallNode = FunctionCallNode;
//# sourceMappingURL=FunctionCallNode.js.map