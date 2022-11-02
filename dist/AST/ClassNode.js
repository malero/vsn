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
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        meta = Object.assign({}, meta) || {};
                        initial = !!meta['initial'];
                        root = false;
                        meta['ClassNodePrepare'] = initial;
                        if (!initial) return [3 /*break*/, 5];
                        if (meta['ClassNodeSelector']) {
                            this._parentSelector = meta['ClassNodeSelector'];
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
                        if (!root) return [3 /*break*/, 4];
                        if (!dom.built) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.findClassElements(dom)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        dom.once('builtRoot', function () { return _this.findClassElements(dom); });
                        _a.label = 4;
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        if (!(meta['PrepForSelector'] === this.fullSelector)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.block.prepare(tag.scope, dom, tag, meta)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.prototype.findClassElements = function (dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tags, _a, _b, element, _c, _d, e_1_1, _e, _f, childSelector, node, tags_1, tags_1_1, _tag, e_2_1, e_3_1;
            var e_1, _g, e_3, _h, e_2, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        tags = [];
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 6, 7, 8]);
                        _a = __values(Array.from(dom.querySelectorAll(this.selector, tag))), _b = _a.next();
                        _k.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        element = _b.value;
                        _d = (_c = tags).push;
                        return [4 /*yield*/, ClassNode.addElementClass(this._fullSelector, element, dom, element[Tag_1.Tag.TaggedVariable] || null)];
                    case 3:
                        _d.apply(_c, [_k.sent()]);
                        _k.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _k.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        _k.trys.push([8, 19, 20, 21]);
                        _e = __values(ClassNode.classChildren[this._fullSelector]), _f = _e.next();
                        _k.label = 9;
                    case 9:
                        if (!!_f.done) return [3 /*break*/, 18];
                        childSelector = _f.value;
                        node = ClassNode.classes[this._fullSelector + " " + childSelector];
                        if (!node)
                            return [3 /*break*/, 17];
                        _k.label = 10;
                    case 10:
                        _k.trys.push([10, 15, 16, 17]);
                        tags_1 = (e_2 = void 0, __values(tags)), tags_1_1 = tags_1.next();
                        _k.label = 11;
                    case 11:
                        if (!!tags_1_1.done) return [3 /*break*/, 14];
                        _tag = tags_1_1.value;
                        return [4 /*yield*/, node.findClassElements(dom, _tag)];
                    case 12:
                        _k.sent();
                        _k.label = 13;
                    case 13:
                        tags_1_1 = tags_1.next();
                        return [3 /*break*/, 11];
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        e_2_1 = _k.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 17];
                    case 16:
                        try {
                            if (tags_1_1 && !tags_1_1.done && (_j = tags_1.return)) _j.call(tags_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 17:
                        _f = _e.next();
                        return [3 /*break*/, 9];
                    case 18: return [3 /*break*/, 21];
                    case 19:
                        e_3_1 = _k.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 21];
                    case 20:
                        try {
                            if (_f && !_f.done && (_h = _e.return)) _h.call(_e);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    ClassNode.prototype.constructTag = function (tag, dom, hasConstruct) {
        if (hasConstruct === void 0) { hasConstruct = null; }
        return __awaiter(this, void 0, void 0, function () {
            var meta, fncCls, fnc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (hasConstruct === null)
                            hasConstruct = this.classScope.has('construct');
                        tag.createScope(true);
                        meta = this.updateMeta();
                        meta['PrepForSelector'] = this.fullSelector;
                        return [4 /*yield*/, this.block.prepare(tag.scope, dom, tag, meta)];
                    case 1:
                        _a.sent();
                        if (!hasConstruct) return [3 /*break*/, 4];
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
    ClassNode.prototype.deconstructTag = function (tag, dom, hasDeconstruct) {
        if (hasDeconstruct === void 0) { hasDeconstruct = null; }
        return __awaiter(this, void 0, void 0, function () {
            var fncCls, fnc, _a, _b, key, on;
            var e_4, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (hasDeconstruct === null)
                            hasDeconstruct = this.classScope.has('deconstruct');
                        if (!hasDeconstruct) return [3 /*break*/, 3];
                        fncCls = this.classScope.get('deconstruct');
                        return [4 /*yield*/, fncCls.getFunction(tag.scope, dom, tag, false)];
                    case 1:
                        fnc = _d.sent();
                        return [4 /*yield*/, fnc()];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        try {
                            for (_a = __values(this.classScope.keys), _b = _a.next(); !_b.done; _b = _a.next()) {
                                key = _b.value;
                                if (this.classScope.get(key) instanceof OnNode_1.OnNode) {
                                    on = this.classScope.get(key);
                                    tag.removeContextEventHandlers(on);
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        tag.dispatch(this.fullSelector + ".deconstruct");
                        ClassNode.preppedTags[this.fullSelector].splice(ClassNode.preppedTags[this.fullSelector].indexOf(tag), 1);
                        return [4 /*yield*/, ClassNode.removePreparedClassFromElement(tag.element, this.fullSelector)];
                    case 4:
                        _d.sent();
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
        var e_5, _a;
        tokens.shift(); // skip 'class'
        var nameParts = [];
        try {
            for (var tokens_1 = __values(tokens), tokens_1_1 = tokens_1.next(); !tokens_1_1.done; tokens_1_1 = tokens_1.next()) {
                var t = tokens_1_1.value;
                if (t.type === AST_1.TokenType.L_BRACE)
                    break;
                nameParts.push(t.value);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (tokens_1_1 && !tokens_1_1.done && (_a = tokens_1.return)) _a.call(tokens_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        var selector = nameParts.join('').trim();
        if (selector.startsWith('>'))
            selector = ":scope " + selector;
        tokens.splice(0, nameParts.length);
        var block = AST_1.Tree.processTokens(AST_1.Tree.getNextStatementTokens(tokens, true, true));
        return new ClassNode(selector, block);
    };
    ClassNode.prototype.getSelectorPath = function () {
        var path = [this.selector];
        var current = this._parentSelector;
        while (current) {
            path.push(ClassNode.classes[current].selector);
            current = ClassNode.classes[current]._parentSelector;
        }
        return path.reverse();
    };
    ClassNode.checkForClassChanges = function (element, dom, tag) {
        var _a;
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var localSelectors, fullSelectors, localSelectors_1, localSelectors_1_1, selector, parentSelectors, fullSelectors_1, fullSelectors_1_1, selector, isPrepped, path, elements, inElements, changed, _b, _c, childSelector, _d, _e, childElement, e_6_1, e_7_1, e_8_1;
            var e_9, _f, e_8, _g, e_7, _h, e_6, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        localSelectors = __spreadArray([element.tagName.toLowerCase()], __read(Array.from(element.classList).map(function (c) { return "." + c; })));
                        fullSelectors = __spreadArray([], __read(ClassNode.getClassesForElement(element)));
                        if (element.id)
                            localSelectors.push("#" + element.id);
                        try {
                            for (localSelectors_1 = __values(localSelectors), localSelectors_1_1 = localSelectors_1.next(); !localSelectors_1_1.done; localSelectors_1_1 = localSelectors_1.next()) {
                                selector = localSelectors_1_1.value;
                                parentSelectors = ClassNode.classParents[selector];
                                if (parentSelectors) {
                                    fullSelectors.push.apply(fullSelectors, __spreadArray([], __read(parentSelectors.filter(function (s) { return !fullSelectors.includes(s); }))));
                                }
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (localSelectors_1_1 && !localSelectors_1_1.done && (_f = localSelectors_1.return)) _f.call(localSelectors_1);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        if (!!tag) return [3 /*break*/, 2];
                        return [4 /*yield*/, dom.getTagForElement(element, true)];
                    case 1:
                        tag = _k.sent();
                        _k.label = 2;
                    case 2:
                        _k.trys.push([2, 23, 24, 25]);
                        fullSelectors_1 = __values(fullSelectors), fullSelectors_1_1 = fullSelectors_1.next();
                        _k.label = 3;
                    case 3:
                        if (!!fullSelectors_1_1.done) return [3 /*break*/, 22];
                        selector = fullSelectors_1_1.value;
                        isPrepped = ClassNode.getClassesForElement(element).includes(selector);
                        path = (_a = ClassNode.classes[selector]) === null || _a === void 0 ? void 0 : _a.getSelectorPath();
                        elements = dom.querySelectPath(path);
                        inElements = elements.includes(element);
                        changed = false;
                        if (!(inElements && !isPrepped)) return [3 /*break*/, 5];
                        return [4 /*yield*/, ClassNode.addElementClass(selector, element, dom, tag)];
                    case 4:
                        _k.sent();
                        changed = true;
                        return [3 /*break*/, 7];
                    case 5:
                        if (!(!inElements && isPrepped)) return [3 /*break*/, 7];
                        return [4 /*yield*/, ClassNode.removeElementClass(selector, element, dom, tag)];
                    case 6:
                        _k.sent();
                        changed = true;
                        _k.label = 7;
                    case 7:
                        if (!(changed && ClassNode.classChildren[selector].length > 0)) return [3 /*break*/, 21];
                        _k.label = 8;
                    case 8:
                        _k.trys.push([8, 19, 20, 21]);
                        _b = (e_7 = void 0, __values(ClassNode.classChildren[selector])), _c = _b.next();
                        _k.label = 9;
                    case 9:
                        if (!!_c.done) return [3 /*break*/, 18];
                        childSelector = _c.value;
                        _k.label = 10;
                    case 10:
                        _k.trys.push([10, 15, 16, 17]);
                        _d = (e_6 = void 0, __values(Array.from(dom.querySelectorAll(childSelector, tag)))), _e = _d.next();
                        _k.label = 11;
                    case 11:
                        if (!!_e.done) return [3 /*break*/, 14];
                        childElement = _e.value;
                        return [4 /*yield*/, ClassNode.checkForClassChanges(childElement, dom, childElement[Tag_1.Tag.TaggedVariable] || null)];
                    case 12:
                        _k.sent();
                        _k.label = 13;
                    case 13:
                        _e = _d.next();
                        return [3 /*break*/, 11];
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        e_6_1 = _k.sent();
                        e_6 = { error: e_6_1 };
                        return [3 /*break*/, 17];
                    case 16:
                        try {
                            if (_e && !_e.done && (_j = _d.return)) _j.call(_d);
                        }
                        finally { if (e_6) throw e_6.error; }
                        return [7 /*endfinally*/];
                    case 17:
                        _c = _b.next();
                        return [3 /*break*/, 9];
                    case 18: return [3 /*break*/, 21];
                    case 19:
                        e_7_1 = _k.sent();
                        e_7 = { error: e_7_1 };
                        return [3 /*break*/, 21];
                    case 20:
                        try {
                            if (_c && !_c.done && (_h = _b.return)) _h.call(_b);
                        }
                        finally { if (e_7) throw e_7.error; }
                        return [7 /*endfinally*/];
                    case 21:
                        fullSelectors_1_1 = fullSelectors_1.next();
                        return [3 /*break*/, 3];
                    case 22: return [3 /*break*/, 25];
                    case 23:
                        e_8_1 = _k.sent();
                        e_8 = { error: e_8_1 };
                        return [3 /*break*/, 25];
                    case 24:
                        try {
                            if (fullSelectors_1_1 && !fullSelectors_1_1.done && (_g = fullSelectors_1.return)) _g.call(fullSelectors_1);
                        }
                        finally { if (e_8) throw e_8.error; }
                        return [7 /*endfinally*/];
                    case 25: return [2 /*return*/];
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
                        if (!tag) {
                            console.error('no tag found for element', element);
                            return [2 /*return*/];
                        }
                        classNode = Registry_1.Registry.instance.classes.getSynchronous(selector);
                        if (!classNode) return [3 /*break*/, 4];
                        return [4 /*yield*/, classNode.constructTag(tag, dom)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, tag];
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