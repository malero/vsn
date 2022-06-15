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
exports.DOM = exports.EQuerySelectDirection = void 0;
var Tag_1 = require("./Tag");
var ElementHelper_1 = require("./helpers/ElementHelper");
var Configuration_1 = require("./Configuration");
var AST_1 = require("./AST");
var TagList_1 = require("./Tag/TagList");
var WrappedWindow_1 = require("./DOM/WrappedWindow");
var WrappedDocument_1 = require("./DOM/WrappedDocument");
var EventDispatcher_1 = require("./EventDispatcher");
var ClassNode_1 = require("./AST/ClassNode");
var Registry_1 = require("./Registry");
var SlotTag_1 = require("./Tag/SlotTag");
var SlottedTag_1 = require("./Tag/SlottedTag");
var EQuerySelectDirection;
(function (EQuerySelectDirection) {
    EQuerySelectDirection[EQuerySelectDirection["ALL"] = 0] = "ALL";
    EQuerySelectDirection[EQuerySelectDirection["UP"] = 1] = "UP";
    EQuerySelectDirection[EQuerySelectDirection["DOWN"] = 2] = "DOWN";
})(EQuerySelectDirection = exports.EQuerySelectDirection || (exports.EQuerySelectDirection = {}));
var DOM = /** @class */ (function (_super) {
    __extends(DOM, _super);
    function DOM(rootElement, build, debug) {
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
    Object.defineProperty(DOM.prototype, "built", {
        get: function () {
            return this._built;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DOM.prototype, "root", {
        get: function () {
            return this._root;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DOM.prototype, "ready", {
        get: function () {
            return this.promise('builtRoot');
        },
        enumerable: false,
        configurable: true
    });
    DOM.prototype.get = function (selector, create, tag, direction) {
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
    DOM.prototype.getFromTag = function (tag, selector, create) {
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
    DOM.prototype.registerElementInRoot = function (tag) {
        var id = tag.element.getAttribute('id');
        if (!!id)
            this.root.scope.set("#" + id, tag.scope);
    };
    DOM.prototype.querySelectorClosest = function (q, tag) {
        if (tag === void 0) { tag = null; }
        return tag.element.closest(q);
    };
    DOM.prototype.querySelectPath = function (path, element) {
        if (element === void 0) { element = null; }
        var current = path.shift();
        if (!current)
            return [];
        var elements = Array.from(element ? this.querySelectorElement(element, current) : this.querySelectorAll(current));
        if (path.length > 0) {
            var result = [];
            for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                var _element = elements_1[_i];
                result.push.apply(result, this.querySelectPath(__spreadArray([], path), _element));
            }
            return result;
        }
        return elements;
    };
    DOM.prototype.querySelectorAll = function (q, tag) {
        if (tag === void 0) { tag = null; }
        var element = tag && !q.startsWith('#') ? tag.element : this.rootElement;
        return this.querySelectorElement(element, q);
    };
    DOM.prototype.querySelectorElement = function (element, q) {
        var parentIndex = q.indexOf(':parent');
        if (parentIndex > -1) {
            var _q = q.substring(0, parentIndex);
            var rest = q.substring(parentIndex + 7);
            if (_q.length > 0) {
                var nodeList = [];
                for (var _i = 0, _a = Array.from(this.querySelectorElement(element, _q)); _i < _a.length; _i++) {
                    var _element = _a[_i];
                    if (rest.length > 0) {
                        nodeList.push.apply(nodeList, Array.from(this.querySelectorElement(_element.parentElement, rest)));
                    }
                    else {
                        nodeList.push(_element.parentElement);
                    }
                }
                return nodeList;
            }
            else if (rest.length === 0) {
                return [element.parentElement];
            }
            else {
                return this.querySelectorElement(element.parentElement, rest);
            }
        }
        var matches = element.querySelectorAll(q);
        if (matches.length === 0 && element.shadowRoot) {
            matches = element.shadowRoot.querySelectorAll(q);
        }
        return matches;
    };
    DOM.prototype.querySelector = function (q) {
        return this.rootElement.querySelector(q);
    };
    DOM.prototype.exec = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var tree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tree = new AST_1.Tree(code);
                        return [4 /*yield*/, tree.prepare(this.root.scope, this)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, tree.evaluate(this.root.scope, this)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DOM.prototype.evaluate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, tag;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        clearTimeout(this.evaluateTimeout);
                        _i = 0, _a = this.tags;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        tag = _a[_i];
                        return [4 /*yield*/, tag.evaluate()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DOM.prototype.mutation = function (mutations) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, mutations_1, mutation, tag, _a, _b, ele, toRemove;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, mutations_1 = mutations;
                        _c.label = 1;
                    case 1:
                        if (!(_i < mutations_1.length)) return [3 /*break*/, 9];
                        mutation = mutations_1[_i];
                        return [4 /*yield*/, this.getTagForElement(mutation.target)];
                    case 2:
                        tag = _c.sent();
                        if (tag) {
                            tag.mutate(mutation);
                        }
                        if (!(mutation.type === 'attributes' && mutation.attributeName === 'class')) return [3 /*break*/, 4];
                        return [4 /*yield*/, ClassNode_1.ClassNode.checkForClassChanges(mutation.target, this, tag)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _a = 0, _b = Array.from(mutation.removedNodes);
                        _c.label = 5;
                    case 5:
                        if (!(_a < _b.length)) return [3 /*break*/, 8];
                        ele = _b[_a];
                        return [4 /*yield*/, this.getTagForElement(ele)];
                    case 6:
                        toRemove = _c.sent();
                        if (toRemove) {
                            toRemove.deconstruct();
                        }
                        _c.label = 7;
                    case 7:
                        _a++;
                        return [3 /*break*/, 5];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    DOM.prototype.discover = function (ele, forComponent) {
        if (forComponent === void 0) { forComponent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var discovered, checkElement, scanChildren;
            var _this = this;
            return __generator(this, function (_a) {
                discovered = [];
                checkElement = function (e) {
                    var _a;
                    if (Registry_1.Registry.instance.components.has((_a = e === null || e === void 0 ? void 0 : e.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase())) {
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
                    for (var _i = 0, _a = Array.from(e.children); _i < _a.length; _i++) {
                        var element = _a[_i];
                        if (!checkElement(element))
                            continue;
                        if (element.tagName.toLowerCase() !== 'template')
                            scanChildren(element);
                    }
                };
                checkElement(ele);
                scanChildren(ele);
                return [2 /*return*/, discovered];
            });
        });
    };
    DOM.prototype.buildTag = function (element, returnExisting, cls) {
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
                return [2 /*return*/, tag];
            });
        });
    };
    DOM.prototype.setupTags = function (tags) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, tags_1, tag, _a, tags_2, tag, _b, tags_3, tag, _c, tags_4, tag, _d, tags_5, tag, _e, tags_6, tag, _f, tags_7, tag;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _i = 0, tags_1 = tags;
                        _g.label = 1;
                    case 1:
                        if (!(_i < tags_1.length)) return [3 /*break*/, 4];
                        tag = tags_1[_i];
                        return [4 /*yield*/, tag.buildAttributes()];
                    case 2:
                        _g.sent();
                        _g.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _a = 0, tags_2 = tags;
                        _g.label = 5;
                    case 5:
                        if (!(_a < tags_2.length)) return [3 /*break*/, 8];
                        tag = tags_2[_a];
                        return [4 /*yield*/, tag.compileAttributes()];
                    case 6:
                        _g.sent();
                        _g.label = 7;
                    case 7:
                        _a++;
                        return [3 /*break*/, 5];
                    case 8:
                        _b = 0, tags_3 = tags;
                        _g.label = 9;
                    case 9:
                        if (!(_b < tags_3.length)) return [3 /*break*/, 12];
                        tag = tags_3[_b];
                        return [4 /*yield*/, tag.setupAttributes()];
                    case 10:
                        _g.sent();
                        _g.label = 11;
                    case 11:
                        _b++;
                        return [3 /*break*/, 9];
                    case 12:
                        _c = 0, tags_4 = tags;
                        _g.label = 13;
                    case 13:
                        if (!(_c < tags_4.length)) return [3 /*break*/, 16];
                        tag = tags_4[_c];
                        return [4 /*yield*/, tag.extractAttributes()];
                    case 14:
                        _g.sent();
                        _g.label = 15;
                    case 15:
                        _c++;
                        return [3 /*break*/, 13];
                    case 16:
                        _d = 0, tags_5 = tags;
                        _g.label = 17;
                    case 17:
                        if (!(_d < tags_5.length)) return [3 /*break*/, 20];
                        tag = tags_5[_d];
                        return [4 /*yield*/, tag.connectAttributes()];
                    case 18:
                        _g.sent();
                        _g.label = 19;
                    case 19:
                        _d++;
                        return [3 /*break*/, 17];
                    case 20:
                        _e = 0, tags_6 = tags;
                        _g.label = 21;
                    case 21:
                        if (!(_e < tags_6.length)) return [3 /*break*/, 24];
                        tag = tags_6[_e];
                        return [4 /*yield*/, tag.finalize()];
                    case 22:
                        _g.sent();
                        this.queued.splice(this.queued.indexOf(tag.element), 1);
                        _g.label = 23;
                    case 23:
                        _e++;
                        return [3 /*break*/, 21];
                    case 24:
                        for (_f = 0, tags_7 = tags; _f < tags_7.length; _f++) {
                            tag = tags_7[_f];
                            this.observer.observe(tag.element, {
                                attributes: true,
                                characterData: true,
                                childList: true,
                                subtree: true
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DOM.prototype.buildFrom = function (ele, isRoot, forComponent) {
        if (isRoot === void 0) { isRoot = false; }
        if (forComponent === void 0) { forComponent = false; }
        return __awaiter(this, void 0, void 0, function () {
            var templateNodes, components, _i, _a, n, tag, newTags, toBuild, _b, toBuild_1, element, tag, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (isRoot) {
                            document.body.setAttribute('vsn-root', '');
                            document.ondragover = function (e) { return e.cancelable && e.preventDefault(); }; // Allow dragging over document
                        }
                        templateNodes = this.querySelectorElement(ele, 'template');
                        components = [];
                        _i = 0, _a = Array.from(templateNodes);
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        n = _a[_i];
                        if (!ElementHelper_1.ElementHelper.hasVisionAttribute(n))
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.buildTag(n)];
                    case 2:
                        tag = _d.sent();
                        if (tag)
                            components.push(tag);
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (!components.length) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.setupTags(components)];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        newTags = [];
                        return [4 /*yield*/, this.discover(ele, forComponent)];
                    case 7:
                        toBuild = _d.sent();
                        _b = 0, toBuild_1 = toBuild;
                        _d.label = 8;
                    case 8:
                        if (!(_b < toBuild_1.length)) return [3 /*break*/, 11];
                        element = toBuild_1[_b];
                        return [4 /*yield*/, this.buildTag(element)];
                    case 9:
                        tag = _d.sent();
                        if (tag)
                            newTags.push(tag);
                        _d.label = 10;
                    case 10:
                        _b++;
                        return [3 /*break*/, 8];
                    case 11:
                        if (!isRoot) return [3 /*break*/, 13];
                        _c = this;
                        return [4 /*yield*/, this.getTagForElement(document.body)];
                    case 12:
                        _c._root = _d.sent();
                        _d.label = 13;
                    case 13: return [4 /*yield*/, this.setupTags(newTags)];
                    case 14:
                        _d.sent();
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
    DOM.prototype.getTagsForElements = function (elements, create) {
        if (create === void 0) { create = false; }
        return __awaiter(this, void 0, void 0, function () {
            var tags, found, _i, elements_2, element, notFound, i, element, _a, notFound_1, element, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tags = new TagList_1.TagList();
                        found = [];
                        for (_i = 0, elements_2 = elements; _i < elements_2.length; _i++) {
                            element = elements_2[_i];
                            if (element[Tag_1.Tag.TaggedVariable]) {
                                tags.push(element[Tag_1.Tag.TaggedVariable]);
                                found.push(element);
                            }
                        }
                        if (!create) return [3 /*break*/, 4];
                        notFound = __spreadArray([], elements);
                        for (i = notFound.length; i >= 0; i--) {
                            element = notFound[i];
                            if (found.indexOf(element) > -1) {
                                notFound.splice(i, 1);
                            }
                        }
                        _a = 0, notFound_1 = notFound;
                        _d.label = 1;
                    case 1:
                        if (!(_a < notFound_1.length)) return [3 /*break*/, 4];
                        element = notFound_1[_a];
                        _c = (_b = tags).push;
                        return [4 /*yield*/, this.getTagForElement(element, create)];
                    case 2:
                        _c.apply(_b, [_d.sent()]);
                        _d.label = 3;
                    case 3:
                        _a++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, tags];
                }
            });
        });
    };
    DOM.prototype.getTagForElement = function (element, create, forComponent) {
        if (create === void 0) { create = false; }
        if (forComponent === void 0) { forComponent = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (element[Tag_1.Tag.TaggedVariable])
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
    DOM.prototype.getTagForScope = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, tag;
            return __generator(this, function (_b) {
                for (_i = 0, _a = this.tags; _i < _a.length; _i++) {
                    tag = _a[_i];
                    if (tag.scope === scope)
                        return [2 /*return*/, tag];
                }
                return [2 /*return*/, null];
            });
        });
    };
    DOM.prototype.resetBranch = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var tag, children, _i, children_1, t;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (e instanceof Tag_1.Tag)
                            e = e.element;
                        tag = e[Tag_1.Tag.TaggedVariable];
                        if (tag)
                            tag.parentTag = null;
                        children = Array.from(e.children);
                        _i = 0, children_1 = children;
                        _a.label = 1;
                    case 1:
                        if (!(_i < children_1.length)) return [3 /*break*/, 4];
                        t = children_1[_i];
                        return [4 /*yield*/, this.resetBranch(t)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (tag && tag.uniqueScope && tag.parentTag) {
                            tag.scope.parentScope = tag.parentTag.scope;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(DOM, "instance", {
        get: function () {
            if (!DOM._instance)
                DOM._instance = new DOM(document, false, false);
            return DOM._instance;
        },
        enumerable: false,
        configurable: true
    });
    DOM.getParentElement = function (element) {
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
    return DOM;
}(EventDispatcher_1.EventDispatcher));
exports.DOM = DOM;
//# sourceMappingURL=DOM.js.map