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
exports.ClassNode = void 0;
var Scope_1 = require("../Scope");
var Tag_1 = require("../Tag");
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var Registry_1 = require("../Registry");
var OnNode_1 = require("./OnNode");
var ClassNode = /** @class */ (function (_super) {
    __extends(ClassNode, _super);
    function ClassNode(selector, block) {
        var _this = _super.call(this) || this;
        _this.selector = selector;
        _this.block = block;
        _this.requiresPrep = true;
        _this.classScope = new Scope_1.Scope();
        return _this;
    }
    Object.defineProperty(ClassNode.prototype, "fullSelector", {
        get: function () {
            return this._fullSelector;
        },
        enumerable: false,
        configurable: true
    });
    ClassNode.prototype.updateMeta = function (meta) {
        meta = meta || {};
        meta['ClassNode'] = this;
        return meta;
    };
    ClassNode.prototype.prepare = function (scope, dom, tag, meta) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var initial, root;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        meta = Object.assign({}, meta) || {};
                        initial = !!meta['initial'];
                        root = false;
                        meta['ClassNodePrepare'] = initial;
                        if (!initial) return [3 /*break*/, 4];
                        if (meta['ClassNodeSelector']) {
                            ClassNode.classChildren[meta['ClassNodeSelector']].push(this.selector);
                            meta['ClassNodeSelector'] = meta['ClassNodeSelector'] + " " + this.selector;
                        }
                        else {
                            root = true;
                            meta['ClassNodeSelector'] = this.selector;
                        }
                        this._fullSelector = meta['ClassNodeSelector'];
                        if (ClassNode.classes[this._fullSelector])
                            return [2 /*return*/]; // Don't re-prepare same classes
                        ClassNode.classes[this._fullSelector] = this;
                        ClassNode.classChildren[this._fullSelector] = [];
                        ClassNode.preppedTags[this._fullSelector] = [];
                        if (ClassNode.classParents[this.selector] === undefined)
                            ClassNode.classParents[this.selector] = [];
                        ClassNode.classParents[this.selector].push(this._fullSelector);
                        return [4 /*yield*/, this.block.prepare(this.classScope, dom, tag, meta)];
                    case 1:
                        _a.sent();
                        Registry_1.Registry.class(this);
                        if (!root) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.findClassElements(dom)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.block.prepare(this.classScope, dom, tag, meta)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.prototype.findClassElements = function (dom) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, element, _b, _c, childSelector, node;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _i = 0, _a = Array.from(dom.querySelectorAll(this._fullSelector));
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        element = _a[_i];
                        return [4 /*yield*/, ClassNode.addElementClass(this._fullSelector, element, dom, element[Tag_1.Tag.TaggedVariable] || null)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _b = 0, _c = ClassNode.classChildren[this._fullSelector];
                        _d.label = 5;
                    case 5:
                        if (!(_b < _c.length)) return [3 /*break*/, 8];
                        childSelector = _c[_b];
                        node = ClassNode.classes[this._fullSelector + " " + childSelector];
                        if (!node)
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, node.findClassElements(dom)];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _b++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.prototype.constructTag = function (tag, dom, hasConstructor) {
        if (hasConstructor === void 0) { hasConstructor = null; }
        return __awaiter(this, void 0, void 0, function () {
            var meta, fncCls, fnc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (hasConstructor === null)
                            hasConstructor = this.classScope.has('construct');
                        tag.createScope(true);
                        meta = this.updateMeta();
                        return [4 /*yield*/, this.block.prepare(tag.scope, dom, tag, meta)];
                    case 1:
                        _a.sent();
                        if (!hasConstructor) return [3 /*break*/, 4];
                        fncCls = this.classScope.get('construct');
                        return [4 /*yield*/, fncCls.getFunction(tag.scope, dom, tag, false)];
                    case 2:
                        fnc = _a.sent();
                        return [4 /*yield*/, fnc()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        tag.dispatch(this.fullSelector + ".construct", tag.element.id);
                        ClassNode.preppedTags[this.fullSelector].push(tag);
                        ClassNode.addPreparedClassToElement(tag.element, this.fullSelector);
                        return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.prototype.deconstructTag = function (tag, dom, hasDeconstructor) {
        if (hasDeconstructor === void 0) { hasDeconstructor = null; }
        return __awaiter(this, void 0, void 0, function () {
            var fncCls, fnc, _i, _a, key, on;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (hasDeconstructor === null)
                            hasDeconstructor = this.classScope.has('deconstruct');
                        if (!hasDeconstructor) return [3 /*break*/, 3];
                        fncCls = this.classScope.get('deconstruct');
                        return [4 /*yield*/, fncCls.getFunction(tag.scope, dom, tag, false)];
                    case 1:
                        fnc = _b.sent();
                        return [4 /*yield*/, fnc()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        for (_i = 0, _a = this.classScope.keys; _i < _a.length; _i++) {
                            key = _a[_i];
                            if (this.classScope.get(key) instanceof OnNode_1.OnNode) {
                                on = this.classScope.get(key);
                                tag.removeContextEventHandlers(on);
                            }
                        }
                        tag.dispatch(this.fullSelector + ".deconstruct");
                        ClassNode.preppedTags[this.fullSelector].splice(ClassNode.preppedTags[this.fullSelector].indexOf(tag), 1);
                        return [4 /*yield*/, ClassNode.removePreparedClassFromElement(tag.element, this.fullSelector)];
                    case 4:
                        _b.sent();
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
        var selector = nameParts.join('').trim();
        tokens.splice(0, nameParts.length);
        var block = AST_1.Tree.processTokens(AST_1.Tree.getNextStatementTokens(tokens, true, true));
        return new ClassNode(selector, block);
    };
    ClassNode.checkForClassChanges = function (element, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var localSelectors, fullSelectors, selector, _i, fullSelectors_1, selector, isPrepped, elements, inElements, changed, _a, _b, childSelector, _c, _d, childElement;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        localSelectors = __spreadArray([element.tagName.toLowerCase()], Array.from(element.classList).map(function (c) { return "." + c; }));
                        fullSelectors = __spreadArray([], ClassNode.getClassesForElement(element));
                        if (element.id)
                            localSelectors.push("#" + element.id);
                        for (selector in localSelectors) {
                            if (ClassNode.classParents[selector])
                                fullSelectors.push.apply(fullSelectors, ClassNode.classParents[selector]);
                        }
                        if (!!tag) return [3 /*break*/, 2];
                        return [4 /*yield*/, dom.getTagForElement(element, true)];
                    case 1:
                        tag = _e.sent();
                        _e.label = 2;
                    case 2:
                        _i = 0, fullSelectors_1 = fullSelectors;
                        _e.label = 3;
                    case 3:
                        if (!(_i < fullSelectors_1.length)) return [3 /*break*/, 14];
                        selector = fullSelectors_1[_i];
                        isPrepped = ClassNode.getClassesForElement(element).includes(selector);
                        elements = Array.from(dom.querySelectorAll(selector));
                        inElements = elements.includes(element);
                        changed = false;
                        if (!(inElements && !isPrepped)) return [3 /*break*/, 5];
                        return [4 /*yield*/, ClassNode.addElementClass(selector, element, dom, tag)];
                    case 4:
                        _e.sent();
                        changed = true;
                        return [3 /*break*/, 7];
                    case 5:
                        if (!(!inElements && isPrepped)) return [3 /*break*/, 7];
                        return [4 /*yield*/, ClassNode.removeElementClass(selector, element, dom, tag)];
                    case 6:
                        _e.sent();
                        changed = true;
                        _e.label = 7;
                    case 7:
                        if (!(changed && ClassNode.classChildren[selector].length > 0)) return [3 /*break*/, 13];
                        _a = 0, _b = ClassNode.classChildren[selector];
                        _e.label = 8;
                    case 8:
                        if (!(_a < _b.length)) return [3 /*break*/, 13];
                        childSelector = _b[_a];
                        _c = 0, _d = Array.from(dom.querySelectorAll(childSelector, tag));
                        _e.label = 9;
                    case 9:
                        if (!(_c < _d.length)) return [3 /*break*/, 12];
                        childElement = _d[_c];
                        return [4 /*yield*/, ClassNode.checkForClassChanges(childElement, dom, childElement[Tag_1.Tag.TaggedVariable] || null)];
                    case 10:
                        _e.sent();
                        _e.label = 11;
                    case 11:
                        _c++;
                        return [3 /*break*/, 9];
                    case 12:
                        _a++;
                        return [3 /*break*/, 8];
                    case 13:
                        _i++;
                        return [3 /*break*/, 3];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.getClassesForElement = function (element) {
        if (!element[ClassNode.ClassesVariable])
            element[ClassNode.ClassesVariable] = [];
        return element[ClassNode.ClassesVariable];
    };
    ClassNode.addPreparedClassToElement = function (element, selector) {
        ClassNode.getClassesForElement(element).push(selector);
    };
    ClassNode.removePreparedClassFromElement = function (element, selector) {
        var classes = ClassNode.getClassesForElement(element);
        classes.splice(classes.indexOf(selector), 1);
    };
    ClassNode.addElementClass = function (selector, element, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var classes, classNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        classes = ClassNode.getClassesForElement(element);
                        if (classes.includes(selector))
                            return [2 /*return*/];
                        if (!!tag) return [3 /*break*/, 2];
                        return [4 /*yield*/, dom.getTagForElement(element, true)];
                    case 1:
                        tag = _a.sent();
                        _a.label = 2;
                    case 2:
                        classNode = Registry_1.Registry.instance.classes.getSynchronous(selector);
                        if (!classNode) return [3 /*break*/, 4];
                        return [4 /*yield*/, classNode.constructTag(tag, dom)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.removeElementClass = function (selector, element, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var classes, classNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        classes = ClassNode.getClassesForElement(element);
                        if (!classes.includes(selector))
                            return [2 /*return*/];
                        if (!!tag) return [3 /*break*/, 2];
                        return [4 /*yield*/, dom.getTagForElement(element, true)];
                    case 1:
                        tag = _a.sent();
                        _a.label = 2;
                    case 2:
                        classNode = Registry_1.Registry.instance.classes.getSynchronous(selector);
                        if (!classNode) return [3 /*break*/, 4];
                        return [4 /*yield*/, classNode.deconstructTag(tag, dom)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.isClass = function (cls) {
        return !!this.classes[cls];
    };
    ClassNode.ClassesVariable = '_vsn_classes';
    ClassNode.classes = {};
    ClassNode.classParents = {};
    ClassNode.classChildren = {}; // List of child class selectors for a given class selector
    ClassNode.preppedTags = {};
    return ClassNode;
}(Node_1.Node));
exports.ClassNode = ClassNode;
//# sourceMappingURL=ClassNode.js.map