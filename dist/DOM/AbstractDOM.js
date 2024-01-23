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
exports.AbstractDOM = exports.EQuerySelectDirection = void 0;
var Tag_1 = require("../Tag");
var WrappedWindow_1 = require("./WrappedWindow");
var WrappedDocument_1 = require("./WrappedDocument");
var Configuration_1 = require("../Configuration");
var TagList_1 = require("../Tag/TagList");
var AST_1 = require("../AST");
var ClassNode_1 = require("../AST/ClassNode");
var Registry_1 = require("../Registry");
var ElementHelper_1 = require("../helpers/ElementHelper");
var SlotTag_1 = require("../Tag/SlotTag");
var SlottedTag_1 = require("../Tag/SlottedTag");
var Scope_1 = require("../Scope");
var EventDispatcher_1 = require("../EventDispatcher");
var EQuerySelectDirection;
(function (EQuerySelectDirection) {
    EQuerySelectDirection[EQuerySelectDirection["ALL"] = 0] = "ALL";
    EQuerySelectDirection[EQuerySelectDirection["UP"] = 1] = "UP";
    EQuerySelectDirection[EQuerySelectDirection["DOWN"] = 2] = "DOWN";
})(EQuerySelectDirection = exports.EQuerySelectDirection || (exports.EQuerySelectDirection = {}));
var AbstractDOM = /** @class */ (function (_super) {
    __extends(AbstractDOM, _super);
    function AbstractDOM(rootElement, build, debug) {
        if (build === void 0) { build = true; }
        if (debug === void 0) { debug = false; }
        var _this = _super.call(this) || this;
        _this.rootElement = rootElement;
        _this.debug = debug;
        _this.queued = [];
        _this._built = false;
        _this._ready = new Promise(function (resolve) {
            _this.once('built', function () {
                resolve(true);
            });
        });
        _this.observer = new MutationObserver(_this.mutation.bind(_this));
        _this.tags = [];
        _this.window = new WrappedWindow_1.WrappedWindow(window);
        _this.document = new WrappedDocument_1.WrappedDocument(window.document);
        if (build) {
            _this.buildFrom(rootElement, true);
        }
        _this.evaluate();
        Configuration_1.Configuration.instance.on('change', _this.evaluate.bind(_this));
        return _this;
    }
    Object.defineProperty(AbstractDOM.prototype, "built", {
        get: function () {
            return this._built;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AbstractDOM.prototype, "root", {
        get: function () {
            return this._root;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AbstractDOM.prototype, "ready", {
        get: function () {
            return this.promise('builtRoot');
        },
        enumerable: false,
        configurable: true
    });
    AbstractDOM.prototype.get = function (selector, create, tag, direction) {
        if (create === void 0) { create = false; }
        if (tag === void 0) { tag = null; }
        if (direction === void 0) { direction = EQuerySelectDirection.DOWN; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, nodes;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = selector;
                        switch (_a) {
                            case 'window': return [3 /*break*/, 1];
                            case 'document': return [3 /*break*/, 2];
                            case 'body': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 4];
                    case 1: return [2 /*return*/, new TagList_1.TagList(this.window)];
                    case 2: return [2 /*return*/, new TagList_1.TagList(this.document)];
                    case 3: return [2 /*return*/, new TagList_1.TagList(this.root)];
                    case 4:
                        nodes = void 0;
                        if (direction === EQuerySelectDirection.DOWN) {
                            nodes = this.querySelectorAll(selector, tag);
                        }
                        else if (direction === EQuerySelectDirection.UP) {
                            nodes = [this.querySelectorClosest(selector, tag)];
                        }
                        else {
                            nodes = this.querySelectorAll(selector);
                        }
                        return [4 /*yield*/, this.getTagsForElements(Array.from(nodes), create)];
                    case 5: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    AbstractDOM.prototype.getFromTag = function (tag, selector, create) {
        if (create === void 0) { create = false; }
        return __awaiter(this, void 0, void 0, function () {
            var nodes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nodes = this.querySelectorElement(tag.element, selector);
                        return [4 /*yield*/, this.getTagsForElements(Array.from(nodes), create)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AbstractDOM.prototype.registerElementInRoot = function (tag) {
        var id = tag.element.getAttribute('id');
        if (!!id)
            this.root.scope.set("#" + id, tag.scope);
    };
    AbstractDOM.prototype.querySelectorClosest = function (q, tag) {
        if (tag === void 0) { tag = null; }
        return tag.element.closest(q);
    };
    AbstractDOM.prototype.querySelectPath = function (path, element) {
        var e_1, _a;
        if (element === void 0) { element = null; }
        var current = path.shift();
        if (!current)
            return [];
        var elements = Array.from(element ? this.querySelectorElement(element, current) : this.querySelectorAll(current));
        if (path.length > 0) {
            var result = [];
            try {
                for (var elements_1 = __values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
                    var _element = elements_1_1.value;
                    result.push.apply(result, __spreadArray([], __read(this.querySelectPath(__spreadArray([], __read(path)), _element))));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (elements_1_1 && !elements_1_1.done && (_a = elements_1.return)) _a.call(elements_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        }
        return elements;
    };
    AbstractDOM.prototype.querySelectorAll = function (q, tag) {
        if (tag === void 0) { tag = null; }
        var element = tag && !q.startsWith('#') ? tag.element : this.rootElement;
        return this.querySelectorElement(element, q);
    };
    AbstractDOM.prototype.querySelectorElement = function (element, q) {
        var e_2, _a;
        var parentIndex = q.indexOf(':parent');
        if (parentIndex > -1) {
            var _q = q.substring(0, parentIndex);
            var rest = q.substring(parentIndex + 7);
            if (_q.length > 0) {
                var nodeList = [];
                try {
                    for (var _b = __values(Array.from(this.querySelectorElement(element, _q))), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var _element = _c.value;
                        if (rest.length > 0) {
                            nodeList.push.apply(nodeList, __spreadArray([], __read(Array.from(this.querySelectorElement(AbstractDOM.getParentElement(_element), rest)))));
                        }
                        else {
                            nodeList.push(AbstractDOM.getParentElement(_element));
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return nodeList;
            }
            else if (rest.length === 0) {
                return [AbstractDOM.getParentElement(element)];
            }
            else {
                return this.querySelectorElement(AbstractDOM.getParentElement(element), rest);
            }
        }
        var matches = element.querySelectorAll(q);
        if (matches.length === 0 && element.shadowRoot) {
            matches = element.shadowRoot.querySelectorAll(q);
        }
        return matches;
    };
    AbstractDOM.prototype.querySelector = function (q) {
        return this.rootElement.querySelector(q);
    };
    AbstractDOM.prototype.exec = function (code, data) {
        return __awaiter(this, void 0, void 0, function () {
            var scope, tree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scope = this.root.scope;
                        if (data) {
                            if (data instanceof Scope_1.Scope) {
                                scope = data;
                            }
                            else {
                                scope = new Scope_1.Scope();
                                scope.wrap(data);
                            }
                        }
                        tree = new AST_1.Tree(code);
                        return [4 /*yield*/, tree.prepare(scope, this)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, tree.evaluate(scope, this)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AbstractDOM.prototype.evaluate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, tag, e_3_1;
            var e_3, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        clearTimeout(this.evaluateTimeout);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, 7, 8]);
                        _a = __values(this.tags), _b = _a.next();
                        _d.label = 2;
                    case 2:
                        if (!!_b.done) return [3 /*break*/, 5];
                        tag = _b.value;
                        return [4 /*yield*/, tag.evaluate()];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        _b = _a.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AbstractDOM.prototype.getTagsFromParent = function (parent, includeParent) {
        var e_4, _a;
        if (includeParent === void 0) { includeParent = true; }
        var tags = [];
        if (includeParent) {
            if (parent[Tag_1.Tag.TaggedVariable]) {
                tags.push(parent[Tag_1.Tag.TaggedVariable]);
            }
        }
        try {
            for (var _b = __values(Array.from(parent.childNodes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var ele = _c.value;
                tags.push.apply(tags, __spreadArray([], __read(this.getTagsFromParent(ele, true))));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return tags;
    };
    AbstractDOM.prototype.mutation = function (mutations) {
        return __awaiter(this, void 0, void 0, function () {
            var mutations_1, mutations_1_1, mutation, tag, _a, _b, ele, _c, _d, tag_1, e_5_1;
            var e_5, _e, e_6, _f, e_7, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 7, 8, 9]);
                        mutations_1 = __values(mutations), mutations_1_1 = mutations_1.next();
                        _h.label = 1;
                    case 1:
                        if (!!mutations_1_1.done) return [3 /*break*/, 6];
                        mutation = mutations_1_1.value;
                        return [4 /*yield*/, this.getTagForElement(mutation.target)];
                    case 2:
                        tag = _h.sent();
                        if (tag) {
                            tag.mutate(mutation);
                        }
                        if (!(mutation.type === 'attributes' && mutation.attributeName === 'class')) return [3 /*break*/, 4];
                        return [4 /*yield*/, ClassNode_1.ClassNode.checkForClassChanges(mutation.target, this, tag)];
                    case 3:
                        _h.sent();
                        _h.label = 4;
                    case 4:
                        try {
                            for (_a = (e_6 = void 0, __values(Array.from(mutation.removedNodes))), _b = _a.next(); !_b.done; _b = _a.next()) {
                                ele = _b.value;
                                try {
                                    for (_c = (e_7 = void 0, __values(this.getTagsFromParent(ele))), _d = _c.next(); !_d.done; _d = _c.next()) {
                                        tag_1 = _d.value;
                                        if (tag_1.hasAttribute('vsn-template'))
                                            continue;
                                        tag_1.deconstruct();
                                    }
                                }
                                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                                finally {
                                    try {
                                        if (_d && !_d.done && (_g = _c.return)) _g.call(_c);
                                    }
                                    finally { if (e_7) throw e_7.error; }
                                }
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        _h.label = 5;
                    case 5:
                        mutations_1_1 = mutations_1.next();
                        return [3 /*break*/, 1];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_5_1 = _h.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (mutations_1_1 && !mutations_1_1.done && (_e = mutations_1.return)) _e.call(mutations_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    AbstractDOM.prototype.discover = function (ele, forComponent) {
        if (forComponent === void 0) { forComponent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var discovered, checkElement, scanChildren;
            var _this = this;
            return __generator(this, function (_a) {
                discovered = [];
                checkElement = function (e) {
                    var _a, _b;
                    if (!forComponent && ((_a = e === null || e === void 0 ? void 0 : e.tagName) === null || _a === void 0 ? void 0 : _a.includes('-'))) {
                        return false;
                    }
                    if (Registry_1.Registry.instance.tags.has((_b = e === null || e === void 0 ? void 0 : e.tagName) === null || _b === void 0 ? void 0 : _b.toLowerCase())) {
                        return false;
                    }
                    if (ElementHelper_1.ElementHelper.hasVisionAttribute(e)) {
                        if ((!forComponent && e.hasAttribute('slot')))
                            return false;
                        if (_this.queued.indexOf(e) > -1)
                            return false;
                        _this.queued.push(e);
                        discovered.push(e);
                    }
                    return true;
                };
                scanChildren = function (e) {
                    var e_8, _a;
                    try {
                        for (var _b = __values(Array.from(e.children)), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var element = _c.value;
                            if (!checkElement(element))
                                continue;
                            if (element.tagName.toLowerCase() !== 'template')
                                scanChildren(element);
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                };
                checkElement(ele);
                scanChildren(ele);
                return [2 /*return*/, discovered];
            });
        });
    };
    AbstractDOM.prototype.buildTag = function (element, returnExisting, cls) {
        if (returnExisting === void 0) { returnExisting = false; }
        if (cls === void 0) { cls = Tag_1.Tag; }
        return __awaiter(this, void 0, void 0, function () {
            var tag;
            return __generator(this, function (_a) {
                if (element[Tag_1.Tag.TaggedVariable])
                    return [2 /*return*/, returnExisting ? element[Tag_1.Tag.TaggedVariable] : null];
                if (element.tagName.toLowerCase() === 'slot')
                    cls = SlotTag_1.SlotTag;
                else if (element.hasAttribute('slot'))
                    cls = SlottedTag_1.SlottedTag;
                tag = new cls(element, this);
                this.tags.push(tag);
                tag.once('deconstruct', this.removeTag, this);
                return [2 /*return*/, tag];
            });
        });
    };
    AbstractDOM.prototype.removeTag = function (tag) {
        var index = this.tags.indexOf(tag);
        if (index > -1)
            this.tags.splice(index, 1);
    };
    AbstractDOM.prototype.setupTags = function (tags) {
        return __awaiter(this, void 0, void 0, function () {
            var tags_1, tags_1_1, tag, e_9_1, tags_2, tags_2_1, tag, e_10_1, tags_3, tags_3_1, tag, e_11_1, tags_4, tags_4_1, tag, e_12_1, tags_5, tags_5_1, tag, e_13_1, tags_6, tags_6_1, tag, e_14_1, tags_7, tags_7_1, tag;
            var e_9, _a, e_10, _b, e_11, _c, e_12, _d, e_13, _e, e_14, _f, e_15, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 5, 6, 7]);
                        tags_1 = __values(tags), tags_1_1 = tags_1.next();
                        _h.label = 1;
                    case 1:
                        if (!!tags_1_1.done) return [3 /*break*/, 4];
                        tag = tags_1_1.value;
                        return [4 /*yield*/, tag.buildAttributes()];
                    case 2:
                        _h.sent();
                        _h.label = 3;
                    case 3:
                        tags_1_1 = tags_1.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_9_1 = _h.sent();
                        e_9 = { error: e_9_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
                        }
                        finally { if (e_9) throw e_9.error; }
                        return [7 /*endfinally*/];
                    case 7:
                        _h.trys.push([7, 12, 13, 14]);
                        tags_2 = __values(tags), tags_2_1 = tags_2.next();
                        _h.label = 8;
                    case 8:
                        if (!!tags_2_1.done) return [3 /*break*/, 11];
                        tag = tags_2_1.value;
                        return [4 /*yield*/, tag.compileAttributes()];
                    case 9:
                        _h.sent();
                        _h.label = 10;
                    case 10:
                        tags_2_1 = tags_2.next();
                        return [3 /*break*/, 8];
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        e_10_1 = _h.sent();
                        e_10 = { error: e_10_1 };
                        return [3 /*break*/, 14];
                    case 13:
                        try {
                            if (tags_2_1 && !tags_2_1.done && (_b = tags_2.return)) _b.call(tags_2);
                        }
                        finally { if (e_10) throw e_10.error; }
                        return [7 /*endfinally*/];
                    case 14:
                        _h.trys.push([14, 19, 20, 21]);
                        tags_3 = __values(tags), tags_3_1 = tags_3.next();
                        _h.label = 15;
                    case 15:
                        if (!!tags_3_1.done) return [3 /*break*/, 18];
                        tag = tags_3_1.value;
                        return [4 /*yield*/, tag.setupAttributes()];
                    case 16:
                        _h.sent();
                        _h.label = 17;
                    case 17:
                        tags_3_1 = tags_3.next();
                        return [3 /*break*/, 15];
                    case 18: return [3 /*break*/, 21];
                    case 19:
                        e_11_1 = _h.sent();
                        e_11 = { error: e_11_1 };
                        return [3 /*break*/, 21];
                    case 20:
                        try {
                            if (tags_3_1 && !tags_3_1.done && (_c = tags_3.return)) _c.call(tags_3);
                        }
                        finally { if (e_11) throw e_11.error; }
                        return [7 /*endfinally*/];
                    case 21:
                        _h.trys.push([21, 26, 27, 28]);
                        tags_4 = __values(tags), tags_4_1 = tags_4.next();
                        _h.label = 22;
                    case 22:
                        if (!!tags_4_1.done) return [3 /*break*/, 25];
                        tag = tags_4_1.value;
                        return [4 /*yield*/, tag.extractAttributes()];
                    case 23:
                        _h.sent();
                        _h.label = 24;
                    case 24:
                        tags_4_1 = tags_4.next();
                        return [3 /*break*/, 22];
                    case 25: return [3 /*break*/, 28];
                    case 26:
                        e_12_1 = _h.sent();
                        e_12 = { error: e_12_1 };
                        return [3 /*break*/, 28];
                    case 27:
                        try {
                            if (tags_4_1 && !tags_4_1.done && (_d = tags_4.return)) _d.call(tags_4);
                        }
                        finally { if (e_12) throw e_12.error; }
                        return [7 /*endfinally*/];
                    case 28:
                        _h.trys.push([28, 33, 34, 35]);
                        tags_5 = __values(tags), tags_5_1 = tags_5.next();
                        _h.label = 29;
                    case 29:
                        if (!!tags_5_1.done) return [3 /*break*/, 32];
                        tag = tags_5_1.value;
                        return [4 /*yield*/, tag.connectAttributes()];
                    case 30:
                        _h.sent();
                        _h.label = 31;
                    case 31:
                        tags_5_1 = tags_5.next();
                        return [3 /*break*/, 29];
                    case 32: return [3 /*break*/, 35];
                    case 33:
                        e_13_1 = _h.sent();
                        e_13 = { error: e_13_1 };
                        return [3 /*break*/, 35];
                    case 34:
                        try {
                            if (tags_5_1 && !tags_5_1.done && (_e = tags_5.return)) _e.call(tags_5);
                        }
                        finally { if (e_13) throw e_13.error; }
                        return [7 /*endfinally*/];
                    case 35:
                        _h.trys.push([35, 40, 41, 42]);
                        tags_6 = __values(tags), tags_6_1 = tags_6.next();
                        _h.label = 36;
                    case 36:
                        if (!!tags_6_1.done) return [3 /*break*/, 39];
                        tag = tags_6_1.value;
                        return [4 /*yield*/, tag.finalize()];
                    case 37:
                        _h.sent();
                        this.queued.splice(this.queued.indexOf(tag.element), 1);
                        _h.label = 38;
                    case 38:
                        tags_6_1 = tags_6.next();
                        return [3 /*break*/, 36];
                    case 39: return [3 /*break*/, 42];
                    case 40:
                        e_14_1 = _h.sent();
                        e_14 = { error: e_14_1 };
                        return [3 /*break*/, 42];
                    case 41:
                        try {
                            if (tags_6_1 && !tags_6_1.done && (_f = tags_6.return)) _f.call(tags_6);
                        }
                        finally { if (e_14) throw e_14.error; }
                        return [7 /*endfinally*/];
                    case 42:
                        try {
                            for (tags_7 = __values(tags), tags_7_1 = tags_7.next(); !tags_7_1.done; tags_7_1 = tags_7.next()) {
                                tag = tags_7_1.value;
                                this.observer.observe(tag.element, {
                                    attributes: true,
                                    characterData: true,
                                    childList: true,
                                    subtree: true
                                });
                            }
                        }
                        catch (e_15_1) { e_15 = { error: e_15_1 }; }
                        finally {
                            try {
                                if (tags_7_1 && !tags_7_1.done && (_g = tags_7.return)) _g.call(tags_7);
                            }
                            finally { if (e_15) throw e_15.error; }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AbstractDOM.prototype.buildFrom = function (ele, isRoot, forComponent) {
        if (isRoot === void 0) { isRoot = false; }
        if (forComponent === void 0) { forComponent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, templateNodes, components, _b, _c, n, tag, e_16_1, newTags, toBuild, toBuild_1, toBuild_1_1, element, tag, e_17_1;
            var e_16, _d, e_17, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!isRoot) return [3 /*break*/, 3];
                        this.rootElement.setAttribute('vsn-root', '');
                        _a = this;
                        return [4 /*yield*/, this.buildTag(this.rootElement, true)];
                    case 1:
                        _a._root = _f.sent();
                        this._root.createScope(true);
                        return [4 /*yield*/, this.setupTags([this._root])];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        templateNodes = this.querySelectorElement(ele, 'template');
                        components = [];
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, 9, 10, 11]);
                        _b = __values(Array.from(templateNodes)), _c = _b.next();
                        _f.label = 5;
                    case 5:
                        if (!!_c.done) return [3 /*break*/, 8];
                        n = _c.value;
                        if (!ElementHelper_1.ElementHelper.hasVisionAttribute(n))
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, this.buildTag(n)];
                    case 6:
                        tag = _f.sent();
                        if (tag)
                            components.push(tag);
                        _f.label = 7;
                    case 7:
                        _c = _b.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_16_1 = _f.sent();
                        e_16 = { error: e_16_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                        }
                        finally { if (e_16) throw e_16.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        if (!components.length) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.setupTags(components)];
                    case 12:
                        _f.sent();
                        _f.label = 13;
                    case 13:
                        newTags = [];
                        return [4 /*yield*/, this.discover(ele, forComponent)];
                    case 14:
                        toBuild = _f.sent();
                        _f.label = 15;
                    case 15:
                        _f.trys.push([15, 20, 21, 22]);
                        toBuild_1 = __values(toBuild), toBuild_1_1 = toBuild_1.next();
                        _f.label = 16;
                    case 16:
                        if (!!toBuild_1_1.done) return [3 /*break*/, 19];
                        element = toBuild_1_1.value;
                        return [4 /*yield*/, this.buildTag(element)];
                    case 17:
                        tag = _f.sent();
                        if (tag)
                            newTags.push(tag);
                        _f.label = 18;
                    case 18:
                        toBuild_1_1 = toBuild_1.next();
                        return [3 /*break*/, 16];
                    case 19: return [3 /*break*/, 22];
                    case 20:
                        e_17_1 = _f.sent();
                        e_17 = { error: e_17_1 };
                        return [3 /*break*/, 22];
                    case 21:
                        try {
                            if (toBuild_1_1 && !toBuild_1_1.done && (_e = toBuild_1.return)) _e.call(toBuild_1);
                        }
                        finally { if (e_17) throw e_17.error; }
                        return [7 /*endfinally*/];
                    case 22: return [4 /*yield*/, this.setupTags(newTags)];
                    case 23:
                        _f.sent();
                        if (isRoot) {
                            this._built = true;
                            this.dispatch('builtRoot');
                        }
                        this.dispatch('built', newTags);
                        return [2 /*return*/, newTags];
                }
            });
        });
    };
    AbstractDOM.prototype.getTagsForElements = function (elements, create) {
        if (create === void 0) { create = false; }
        return __awaiter(this, void 0, void 0, function () {
            var tags, found, elements_2, elements_2_1, element, notFound, i, element, notFound_1, notFound_1_1, element, _a, _b, e_18_1;
            var e_19, _c, e_18, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        tags = new TagList_1.TagList();
                        found = [];
                        try {
                            for (elements_2 = __values(elements), elements_2_1 = elements_2.next(); !elements_2_1.done; elements_2_1 = elements_2.next()) {
                                element = elements_2_1.value;
                                if (element && element[Tag_1.Tag.TaggedVariable]) {
                                    tags.push(element[Tag_1.Tag.TaggedVariable]);
                                    found.push(element);
                                }
                            }
                        }
                        catch (e_19_1) { e_19 = { error: e_19_1 }; }
                        finally {
                            try {
                                if (elements_2_1 && !elements_2_1.done && (_c = elements_2.return)) _c.call(elements_2);
                            }
                            finally { if (e_19) throw e_19.error; }
                        }
                        if (!create) return [3 /*break*/, 8];
                        notFound = __spreadArray([], __read(elements));
                        for (i = notFound.length; i >= 0; i--) {
                            element = notFound[i];
                            if (found.indexOf(element) > -1) {
                                notFound.splice(i, 1);
                            }
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 6, 7, 8]);
                        notFound_1 = __values(notFound), notFound_1_1 = notFound_1.next();
                        _e.label = 2;
                    case 2:
                        if (!!notFound_1_1.done) return [3 /*break*/, 5];
                        element = notFound_1_1.value;
                        _b = (_a = tags).push;
                        return [4 /*yield*/, this.getTagForElement(element, create)];
                    case 3:
                        _b.apply(_a, [_e.sent()]);
                        _e.label = 4;
                    case 4:
                        notFound_1_1 = notFound_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_18_1 = _e.sent();
                        e_18 = { error: e_18_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (notFound_1_1 && !notFound_1_1.done && (_d = notFound_1.return)) _d.call(notFound_1);
                        }
                        finally { if (e_18) throw e_18.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, tags];
                }
            });
        });
    };
    AbstractDOM.prototype.getTagForElement = function (element, create, forComponent) {
        if (create === void 0) { create = false; }
        if (forComponent === void 0) { forComponent = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (element && element[Tag_1.Tag.TaggedVariable])
                            return [2 /*return*/, element[Tag_1.Tag.TaggedVariable]];
                        if (!(element && create)) return [3 /*break*/, 3];
                        if (element instanceof HTMLElement)
                            element.setAttribute('vsn-ref', '');
                        return [4 /*yield*/, this.buildFrom(element.parentElement || element, false, forComponent)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getTagForElement(element, false)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    };
    AbstractDOM.prototype.getTagForScope = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, tag;
            var e_20, _c;
            return __generator(this, function (_d) {
                try {
                    for (_a = __values(this.tags), _b = _a.next(); !_b.done; _b = _a.next()) {
                        tag = _b.value;
                        if (tag.uniqueScope && tag.scope === scope)
                            return [2 /*return*/, tag];
                    }
                }
                catch (e_20_1) { e_20 = { error: e_20_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_20) throw e_20.error; }
                }
                return [2 /*return*/, null];
            });
        });
    };
    AbstractDOM.prototype.resetBranch = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var tag, children, children_1, children_1_1, t, e_21_1;
            var e_21, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (e instanceof Tag_1.Tag)
                            e = e.element;
                        tag = e[Tag_1.Tag.TaggedVariable];
                        if (tag) {
                            tag.findParentTag();
                        }
                        children = Array.from(e.children);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        children_1 = __values(children), children_1_1 = children_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!children_1_1.done) return [3 /*break*/, 5];
                        t = children_1_1.value;
                        return [4 /*yield*/, this.resetBranch(t)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        children_1_1 = children_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_21_1 = _b.sent();
                        e_21 = { error: e_21_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
                        }
                        finally { if (e_21) throw e_21.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AbstractDOM.getParentElement = function (element) {
        if (element.parentElement) {
            return element.parentElement;
        }
        else if (element.assignedSlot) {
            return element.assignedSlot.parentElement;
        }
        else if (element['shadowParent']) {
            return element['shadowParent'];
        }
        return null;
    };
    return AbstractDOM;
}(EventDispatcher_1.EventDispatcher));
exports.AbstractDOM = AbstractDOM;
//# sourceMappingURL=AbstractDOM.js.map