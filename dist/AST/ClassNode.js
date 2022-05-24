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
exports.ClassNode = void 0;
var Scope_1 = require("../Scope");
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var Registry_1 = require("../Registry");
var OnNode_1 = require("./OnNode");
var ClassNode = /** @class */ (function (_super) {
    __extends(ClassNode, _super);
    function ClassNode(name, block) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.block = block;
        _this.requiresPrep = true;
        _this.classScope = new Scope_1.Scope();
        return _this;
    }
    ClassNode.prototype.prepare = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var hasConstructor, _i, _a, element, tag_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (ClassNode.classes[this.name])
                            return [2 /*return*/]; // Don't re-prepare same classes
                        ClassNode.classes[this.name] = this;
                        return [4 /*yield*/, this.block.prepare(this.classScope, dom, tag)];
                    case 1:
                        _b.sent();
                        Registry_1.Registry.class(this);
                        hasConstructor = this.classScope.has('construct');
                        _i = 0, _a = Array.from(dom.querySelectorAll("." + this.name));
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        element = _a[_i];
                        return [4 /*yield*/, dom.getTagForElement(element, true)];
                    case 3:
                        tag_1 = _b.sent();
                        if (!tag_1) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.prepareTag(tag_1, dom, hasConstructor)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.prototype.prepareTag = function (tag, dom, hasConstructor) {
        if (hasConstructor === void 0) { hasConstructor = null; }
        return __awaiter(this, void 0, void 0, function () {
            var fnc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (hasConstructor === null)
                            hasConstructor = this.classScope.has('construct');
                        tag.createScope(true);
                        return [4 /*yield*/, this.block.prepare(tag.scope, dom, tag)];
                    case 1:
                        _a.sent();
                        if (!hasConstructor) return [3 /*break*/, 3];
                        fnc = this.classScope.get('construct');
                        return [4 /*yield*/, fnc.evaluate(tag.scope, dom, tag)];
                    case 2:
                        (_a.sent())();
                        _a.label = 3;
                    case 3:
                        /*
                        for (const key of this.classScope.keys) {
                            if (this.classScope.get(key) instanceof OnNode) {
                                const on = this.classScope.get(key) as OnNode;
                                tag.addEventHandler(on.name, [], await on.getFunction(tag.scope, dom, tag), on);
                            }
                        }
                         */
                        tag.preppedClasses.push(this.name);
                        return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.prototype.tearDownTag = function (tag, dom, hasDeconstructor) {
        if (hasDeconstructor === void 0) { hasDeconstructor = null; }
        return __awaiter(this, void 0, void 0, function () {
            var fnc, _i, _a, key, on;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (hasDeconstructor === null)
                            hasDeconstructor = this.classScope.has('deconstruct');
                        if (!hasDeconstructor) return [3 /*break*/, 2];
                        fnc = this.classScope.get('deconstruct');
                        return [4 /*yield*/, fnc.evaluate(tag.scope, dom, tag)];
                    case 1:
                        (_b.sent())();
                        _b.label = 2;
                    case 2:
                        for (_i = 0, _a = this.classScope.keys; _i < _a.length; _i++) {
                            key = _a[_i];
                            if (this.classScope.get(key) instanceof OnNode_1.OnNode) {
                                on = this.classScope.get(key);
                                tag.removeContextEventHandlers(on);
                            }
                        }
                        tag.preppedClasses.splice(tag.preppedClasses.indexOf(this.name), 1);
                        return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, null];
            });
        });
    };
    ClassNode.parse = function (lastNode, token, tokens) {
        tokens.shift(); // skip 'class'
        var nameParts = [];
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var t = tokens_1[_i];
            if (t.type === AST_1.TokenType.L_BRACE)
                break;
            nameParts.push(t.value);
        }
        var name = nameParts.join('');
        tokens.splice(0, nameParts.length);
        var block = AST_1.Tree.processTokens(AST_1.Tree.getNextStatementTokens(tokens, true, true));
        return new ClassNode(name, block);
    };
    ClassNode.classes = {};
    return ClassNode;
}(Node_1.Node));
exports.ClassNode = ClassNode;
//# sourceMappingURL=ClassNode.js.map