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
exports.FunctionNode = void 0;
var Scope_1 = require("../Scope");
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var FunctionNode = /** @class */ (function (_super) {
    __extends(FunctionNode, _super);
    function FunctionNode(name, args, block) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.args = args;
        _this.block = block;
        _this.requiresPrep = true;
        _this.garbage = [];
        return _this;
    }
    FunctionNode.prototype._getChildNodes = function () {
        return [
            this.block
        ];
    };
    FunctionNode.prototype.prepare = function (scope, dom, tag, meta) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // if (meta?.ClassNode) {
                        //     // Set on object instance
                        //     if (tag && tag.scope.has('this')) {
                        //         tag.scope.get('this').set(this.name, this);
                        //     }
                        // } else {
                        //     scope.set(this.name, this);
                        // }
                        scope.set(this.name, this);
                        return [4 /*yield*/, _super.prototype.prepare.call(this, scope, dom, tag, meta)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    FunctionNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFunction(scope, dom, tag)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    FunctionNode.prototype.collectGarbage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, f;
            var e_1, _c;
            return __generator(this, function (_d) {
                try {
                    for (_a = __values(this.garbage), _b = _a.next(); !_b.done; _b = _a.next()) {
                        f = _b.value;
                        f.deconstruct();
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                this.garbage = [];
                return [2 /*return*/];
            });
        });
    };
    FunctionNode.prototype.getFunction = function (scope, dom, tag, createFunctionScope) {
        if (tag === void 0) { tag = null; }
        if (createFunctionScope === void 0) { createFunctionScope = true; }
        return __awaiter(this, void 0, void 0, function () {
            var self;
            var _this = this;
            return __generator(this, function (_a) {
                self = this;
                return [2 /*return*/, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        return __awaiter(_this, void 0, void 0, function () {
                            var functionScope, _a, _b, arg;
                            var e_2, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (createFunctionScope && !(scope instanceof Scope_1.FunctionScope)) {
                                            functionScope = new Scope_1.FunctionScope(scope);
                                            functionScope.set('this', scope);
                                            self.garbage.push(functionScope);
                                        }
                                        else {
                                            functionScope = scope;
                                        }
                                        try {
                                            for (_a = __values(this.args), _b = _a.next(); !_b.done; _b = _a.next()) {
                                                arg = _b.value;
                                                functionScope.set(arg, args.shift());
                                            }
                                        }
                                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                        finally {
                                            try {
                                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                            }
                                            finally { if (e_2) throw e_2.error; }
                                        }
                                        return [4 /*yield*/, this.block.evaluate(functionScope, dom, tag)];
                                    case 1: return [2 /*return*/, _d.sent()];
                                }
                            });
                        });
                    }];
            });
        });
    };
    FunctionNode.parse = function (lastNode, token, tokens, cls) {
        var e_3, _a;
        if (cls === void 0) { cls = FunctionNode; }
        tokens.shift(); // skip 'func'
        var name = tokens.shift();
        var modifiers = this.moveModifiers(tokens);
        var argTokens = AST_1.Tree.getBlockTokens(tokens);
        var funcArgs = [];
        try {
            for (var argTokens_1 = __values(argTokens), argTokens_1_1 = argTokens_1.next(); !argTokens_1_1.done; argTokens_1_1 = argTokens_1.next()) {
                var t = argTokens_1_1.value;
                funcArgs.push(t[0].value);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (argTokens_1_1 && !argTokens_1_1.done && (_a = argTokens_1.return)) _a.call(argTokens_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var block = AST_1.Tree.processTokens(AST_1.Tree.getNextStatementTokens(tokens, true, true));
        this.moveModifiers(modifiers, tokens);
        return new cls(name.value, funcArgs, block);
    };
    return FunctionNode;
}(Node_1.Node));
exports.FunctionNode = FunctionNode;
//# sourceMappingURL=FunctionNode.js.map