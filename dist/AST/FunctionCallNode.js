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
            var tags, functionScope, functionName, instanceOfScopeMemberNode, _tags, values, func, functionName_1, returnValues, toCleanup, calls, _i, tags_1, _tag, tagNum, _a, _b, className, cls, fnc, _c, _d, _e, toCleanup_1, fnc, r;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        tags = [];
                        functionScope = scope;
                        functionName = '';
                        instanceOfScopeMemberNode = false;
                        if (!(this.fnc instanceof ScopeMemberNode_1.ScopeMemberNode)) return [3 /*break*/, 5];
                        instanceOfScopeMemberNode = true;
                        return [4 /*yield*/, this.fnc.scope.evaluate(scope, dom, tag)];
                    case 1:
                        functionScope = _f.sent();
                        return [4 /*yield*/, this.fnc.name.evaluate(scope, dom, tag)];
                    case 2:
                        functionName = _f.sent();
                        if (!(this.fnc.scope instanceof ElementQueryNode_1.ElementQueryNode)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.fnc.scope.evaluate(scope, dom, tag)];
                    case 3:
                        _tags = _f.sent();
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
                        _f.label = 5;
                    case 5: return [4 /*yield*/, this.args.evaluate(scope, dom, tag)];
                    case 6:
                        values = _f.sent();
                        return [4 /*yield*/, this.fnc.evaluate(scope, dom, tag)];
                    case 7:
                        func = _f.sent();
                        console.log(tag === null || tag === void 0 ? void 0 : tag.element, functionName, func, scope.keys, functionScope === null || functionScope === void 0 ? void 0 : functionScope.keys, instanceOfScopeMemberNode);
                        if (!(!func || func instanceof Array)) return [3 /*break*/, 20];
                        return [4 /*yield*/, this.fnc.name.evaluate(scope, dom, tag)];
                    case 8:
                        functionName_1 = _f.sent();
                        returnValues = [];
                        toCleanup = [];
                        calls = 0;
                        _i = 0, tags_1 = tags;
                        _f.label = 9;
                    case 9:
                        if (!(_i < tags_1.length)) return [3 /*break*/, 15];
                        _tag = tags_1[_i];
                        tagNum = 0;
                        _a = 0, _b = _tag.element[ClassNode_1.ClassNode.ClassesVariable] || [];
                        _f.label = 10;
                    case 10:
                        if (!(_a < _b.length)) return [3 /*break*/, 14];
                        className = _b[_a];
                        tagNum++;
                        cls = Registry_1.Registry.instance.classes.getSynchronous(className);
                        if (!cls) return [3 /*break*/, 13];
                        if (!cls.classScope.has(functionName_1)) return [3 /*break*/, 13];
                        fnc = cls.classScope.get(functionName_1);
                        toCleanup.push(fnc);
                        _d = (_c = returnValues).push;
                        return [4 /*yield*/, fnc.evaluate(_tag.scope, dom, _tag)];
                    case 11: return [4 /*yield*/, (_f.sent()).apply(void 0, values)];
                    case 12:
                        _d.apply(_c, [_f.sent()]);
                        calls++;
                        _f.label = 13;
                    case 13:
                        _a++;
                        return [3 /*break*/, 10];
                    case 14:
                        _i++;
                        return [3 /*break*/, 9];
                    case 15:
                        _e = 0, toCleanup_1 = toCleanup;
                        _f.label = 16;
                    case 16:
                        if (!(_e < toCleanup_1.length)) return [3 /*break*/, 19];
                        fnc = toCleanup_1[_e];
                        return [4 /*yield*/, fnc.collectGarbage()];
                    case 17:
                        _f.sent();
                        _f.label = 18;
                    case 18:
                        _e++;
                        return [3 /*break*/, 16];
                    case 19:
                        if (calls === 1) {
                            return [2 /*return*/, returnValues[0]];
                        }
                        else if (calls === 0) {
                            throw new Error("Function " + functionName_1 + " not found");
                        }
                        else {
                            return [2 /*return*/, returnValues];
                        }
                        return [3 /*break*/, 25];
                    case 20:
                        if (!(func instanceof FunctionNode_1.FunctionNode)) return [3 /*break*/, 24];
                        return [4 /*yield*/, func.evaluate(functionScope, dom, tag)];
                    case 21: return [4 /*yield*/, (_f.sent()).apply(void 0, values)];
                    case 22:
                        r = _f.sent();
                        return [4 /*yield*/, func.collectGarbage()];
                    case 23:
                        _f.sent();
                        return [2 /*return*/, r];
                    case 24: return [2 /*return*/, func.call.apply(func, __spreadArray([functionScope.wrapped || functionScope], values))];
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    return FunctionCallNode;
}(Node_1.Node));
exports.FunctionCallNode = FunctionCallNode;
//# sourceMappingURL=FunctionCallNode.js.map