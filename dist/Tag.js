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
exports.Tag = exports.TagState = void 0;
var Scope_1 = require("./Scope");
var Attribute_1 = require("./Attribute");
var DOM_1 = require("./DOM");
var Controller_1 = require("./Controller");
var VisionHelper_1 = require("./helpers/VisionHelper");
var StandardAttribute_1 = require("./attributes/StandardAttribute");
var On_1 = require("./attributes/On");
var Registry_1 = require("./Registry");
var DOMObject_1 = require("./DOM/DOMObject");
var AST_1 = require("./AST");
var StyleAttribute_1 = require("./attributes/StyleAttribute");
var Modifiers_1 = require("./Modifiers");
var TagState;
(function (TagState) {
    TagState[TagState["Instantiated"] = 0] = "Instantiated";
    TagState[TagState["AttributesBuilt"] = 1] = "AttributesBuilt";
    TagState[TagState["AttributesCompiled"] = 2] = "AttributesCompiled";
    TagState[TagState["AttributesSetup"] = 3] = "AttributesSetup";
    TagState[TagState["AttributesExtracted"] = 4] = "AttributesExtracted";
    TagState[TagState["AttributesConnected"] = 5] = "AttributesConnected";
    TagState[TagState["Built"] = 6] = "Built";
})(TagState = exports.TagState || (exports.TagState = {}));
var Tag = /** @class */ (function (_super) {
    __extends(Tag, _super);
    function Tag(element, dom) {
        var props = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            props[_i - 2] = arguments[_i];
        }
        var _this = _super.call(this, element, props) || this;
        _this.dom = dom;
        _this.deferredAttributes = [];
        _this.attributes = new Map();
        _this._nonDeferredAttributes = [];
        _this._children = [];
        _this.inputTags = [
            'input',
            'select',
            'textarea'
        ];
        element[Tag.TaggedVariable] = _this;
        _this.rawAttributes = {};
        _this.parsedAttributes = {};
        _this.onEventHandlers = {};
        _this.analyzeElementAttributes();
        _this._state = TagState.Instantiated;
        return _this;
    }
    Object.defineProperty(Tag.prototype, "uniqueScope", {
        get: function () {
            return this._uniqueScope;
        },
        enumerable: false,
        configurable: true
    });
    ;
    Object.defineProperty(Tag.prototype, "meta", {
        get: function () {
            if (!this._meta)
                this._meta = {};
            return this._meta;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Tag.prototype.onAttributeStateChange = function (event) {
        if (event.previouseState === Attribute_1.AttributeState.Deferred) // @todo: what is this?
            this._nonDeferredAttributes.length = 0;
    };
    Tag.prototype.getAttributesWithState = function (state) {
        var e_1, _a;
        var attrs = [];
        try {
            for (var _b = __values(this.attributes.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var attr = _c.value;
                if (attr.state === state)
                    attrs.push(attr);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return attrs;
    };
    Object.defineProperty(Tag.prototype, "nonDeferredAttributes", {
        get: function () {
            var e_2, _a;
            if (this._nonDeferredAttributes.length > 0)
                return this._nonDeferredAttributes;
            var attrs = [];
            try {
                for (var _b = __values(this.attributes.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var attr = _c.value;
                    if (attr.state !== Attribute_1.AttributeState.Deferred)
                        attrs.push(attr);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this._nonDeferredAttributes = attrs;
            return attrs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "style", {
        get: function () {
            return this.element.style;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "computedStyle", {
        get: function () {
            return VisionHelper_1.VisionHelper.window && window.getComputedStyle(this.element) || null;
        },
        enumerable: false,
        configurable: true
    });
    Tag.prototype.analyzeElementAttributes = function () {
        if (!this.element.attributes || this.element.attributes.length <= 0)
            return;
        for (var i = 0; i < this.element.attributes.length; i++) {
            var a = this.element.attributes[i];
            this.rawAttributes[a.name] = a.value;
            if (a.name.indexOf(':') > -1) {
                var nameParts = a.name.split(':');
                var values = nameParts.slice(1);
                values.push(a.value);
                this.parsedAttributes[nameParts[0]] = values;
            }
            else {
                this.parsedAttributes[a.name] = [null, a.value];
            }
        }
    };
    Tag.prototype.exec = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var tree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tree = new AST_1.Tree(code);
                        return [4 /*yield*/, tree.prepare(this.scope, this.dom, this)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, tree.evaluate(this.scope, this.dom, this)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Tag.prototype.evaluate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, attr, e_3_1;
            var e_3, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.nonDeferredAttributes), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        attr = _b.value;
                        return [4 /*yield*/, attr.evaluate()];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.mutate = function (mutation) {
        this.attributes.forEach(function (attr) { return attr.mutate(mutation); });
        this.dispatch('mutate', mutation);
    };
    Tag.prototype.get = function (attr) {
        this.element.getAttribute(attr);
    };
    Tag.prototype.set = function (attr, value) {
        this.element.setAttribute(attr, value);
    };
    Tag.prototype.getAttributeClass = function (attr) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!attr.startsWith('vsn-'))
                    return [2 /*return*/, null];
                attr = this.getAttributeName(attr);
                return [2 /*return*/, Registry_1.Registry.instance.attributes.get(attr)];
            });
        });
    };
    Tag.prototype.getAttributeName = function (attr) {
        attr = attr.split('|')[0];
        if (attr.indexOf(':') > -1) {
            var parts = attr.split(':');
            attr = parts[0];
        }
        return attr;
    };
    Tag.prototype.getAttributeBinding = function (attr) {
        attr = attr.split('|')[0];
        if (attr.indexOf(':') > -1) {
            var parts = attr.split(':');
            return parts[1];
        }
        return null;
    };
    Object.defineProperty(Tag.prototype, "isInput", {
        get: function () {
            return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "isSelect", {
        get: function () {
            return this.element.tagName.toLowerCase() === 'select';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "isMultipleSelect", {
        get: function () {
            return this.isSelect && this.element.hasAttribute('multiple');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "value", {
        get: function () {
            if (this.isInput) {
                if (this.isMultipleSelect) {
                    return Array.from(this.element.options).filter(function (o) { return o.selected; }).map(function (o) { return o.value; });
                }
                return this.element.value;
            }
            else {
                return this.element.textContent;
            }
        },
        set: function (value) {
            var e_4, _a;
            if (this.isInput) {
                if (this.isMultipleSelect) {
                    try {
                        for (var _b = __values(Array.from(this.element.options)), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var option = _c.value;
                            option.selected = value.indexOf(option.value) > -1;
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                }
                else {
                    this.element.setAttribute('value', value);
                    this.element.value = value;
                }
            }
            else {
                this.element.innerText = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "checked", {
        get: function () {
            if (this.isInput) {
                return this.element.checked;
            }
            else {
                return false;
            }
        },
        set: function (value) {
            if (this.isInput) {
                if (value) {
                    this.element.setAttribute('checked', '');
                    this.element.checked = true;
                }
                else {
                    this.element.removeAttribute('checked');
                    this.element.checked = false;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Tag.prototype.addChild = function (tag) {
        this._children.push(tag);
    };
    Tag.prototype.removeChild = function (tag) {
        this._children.splice(this._children.indexOf(tag), 1);
    };
    Object.defineProperty(Tag.prototype, "children", {
        get: function () {
            return __spreadArray([], __read(this._children));
        },
        enumerable: false,
        configurable: true
    });
    Tag.prototype.findParentTag = function () {
        var foundParent = false;
        if (this.element) {
            var parentElement = DOM_1.DOM.getParentElement(this.element);
            while (parentElement) {
                if (parentElement[Tag.TaggedVariable]) {
                    foundParent = true;
                    this.parentTag = parentElement[Tag.TaggedVariable];
                    break;
                }
                parentElement = DOM_1.DOM.getParentElement(parentElement);
            }
        }
        if (!foundParent && DOM_1.DOM.instance.root !== this)
            return DOM_1.DOM.instance.root;
    };
    Object.defineProperty(Tag.prototype, "parentTag", {
        get: function () {
            if (!this._parentTag) {
                this.findParentTag();
            }
            return this._parentTag;
        },
        set: function (tag) {
            if (this.element === document.body || tag.element === document.body)
                return;
            if (this._parentTag && this._parentTag !== tag) {
                this._parentTag.removeChild(this);
                this.scope.parentScope = null;
            }
            this._parentTag = tag;
            if (tag) {
                tag.addChild(this);
                if (this.scope !== tag.scope) {
                    this.scope.parentScope = tag.scope;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "scope", {
        get: function () {
            if (!!this._scope)
                return this._scope;
            if (this.uniqueScope)
                return this.createScope(true);
            if (!!this.parentTag)
                return this.parentTag.scope;
            return DOM_1.DOM.instance.root.scope;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "controller", {
        get: function () {
            return this._controller;
        },
        set: function (controller) {
            this._controller = controller;
        },
        enumerable: false,
        configurable: true
    });
    Tag.prototype.wrap = function (obj, triggerUpdates, updateFromWrapped) {
        if (triggerUpdates === void 0) { triggerUpdates = false; }
        if (updateFromWrapped === void 0) { updateFromWrapped = true; }
        if (VisionHelper_1.VisionHelper.isConstructor(obj)) {
            obj = new obj();
        }
        if (obj instanceof Controller_1.Controller) {
            obj.init(this.scope, this, this.element);
            this.controller = obj;
        }
        else {
            obj['$scope'] = this.scope;
            obj['$tag'] = this;
            obj['$el'] = this.element;
        }
        this.scope.wrap(obj, triggerUpdates, updateFromWrapped);
        return obj;
    };
    Tag.prototype.unwrap = function () {
        this.scope.unwrap();
    };
    Tag.prototype.removeFromDOM = function () {
        this.element.remove();
    };
    Tag.prototype.addToParentElement = function () {
        this.parentTag.element.appendChild(this.element);
    };
    Tag.prototype.hide = function () {
        this.element.hidden = true;
    };
    Tag.prototype.show = function () {
        this.element.hidden = false;
    };
    Tag.prototype.findAncestorByAttribute = function (attr, includeSelf) {
        if (includeSelf === void 0) { includeSelf = false; }
        if (includeSelf && this.hasAttribute(attr))
            return this;
        return this.parentTag ? this.parentTag.findAncestorByAttribute(attr, true) : null;
    };
    Tag.prototype.findDescendantsByAttribute = function (attr, includeSelf) {
        var e_5, _a;
        if (includeSelf === void 0) { includeSelf = false; }
        var tags = [];
        if (includeSelf && this.hasAttribute(attr))
            tags.push(this);
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                tags.concat(child.findDescendantsByAttribute(attr, true));
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return tags;
    };
    Tag.prototype.findChildrenByAttribute = function (attr) {
        return this.children.filter(function (child) { return child.hasAttribute(attr); });
    };
    Tag.prototype.hasAttribute = function (attr) {
        return !!this.parsedAttributes[attr];
    };
    Tag.prototype.getAttribute = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var cls, _a, _b, attr;
            var e_6, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, Registry_1.Registry.instance.attributes.get(key)];
                    case 1:
                        cls = _d.sent();
                        if (!cls)
                            return [2 /*return*/];
                        try {
                            for (_a = __values(this.attributes.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                                attr = _b.value;
                                if (attr instanceof cls)
                                    return [2 /*return*/, attr];
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.isMagicAttribute = function (key) {
        return Tag.magicAttributes.indexOf(key) > -1;
    };
    Tag.prototype.setElementAttribute = function (key, value) {
        var _a, _b;
        if (this.isMagicAttribute(key)) {
            if (key === '@text')
                this.element.innerText = value;
            else if (key === '@html') {
                this.element.innerHTML = value;
                DOM_1.DOM.instance.buildFrom(this.element).then(function (tag) {
                    AST_1.Tree.reprepareExecutingTrees();
                });
            }
            else if (key === '@value')
                this.value = value;
            else if (key === '@class' && value) {
                (_a = this.element.classList).remove.apply(_a, __spreadArray([], __read(Array.from(this.element.classList))));
                var classes = value instanceof Array ? value : [value];
                if (classes.length)
                    (_b = this.element.classList).add.apply(_b, __spreadArray([], __read(classes)));
            }
            else if (Tag.flagAttributes.indexOf(key) > -1) {
                var attrKey = key.replace('@', '');
                if (!!value) {
                    this.element.setAttribute(attrKey, '');
                }
                else {
                    this.element.removeAttribute(attrKey);
                }
            }
        }
        else {
            this.element.setAttribute(key, value);
        }
    };
    Tag.prototype.getElementAttribute = function (key) {
        if (this.isMagicAttribute(key)) {
            if (key === '@text')
                return this.element.innerText;
            else if (key === '@html')
                return this.element.innerHTML;
            else if (key === '@value')
                return this.value;
            else if (key === '@class') {
                return Array.from(this.element.classList);
            }
            else if (Tag.flagAttributes.indexOf(key) > -1) {
                var attrKey = key.replace('@', '');
                return this.element.hasAttribute(attrKey);
            }
        }
        return this.element.getAttribute(key);
    };
    Tag.prototype.getRawAttributeValue = function (key, fallback) {
        if (fallback === void 0) { fallback = null; }
        return this.rawAttributes[key] ? this.rawAttributes[key] : fallback;
    };
    Tag.prototype.hasRawAttribute = function (mod) {
        return this.getRawAttributeValue(mod, undefined) !== undefined;
    };
    Tag.prototype.getParsedAttributeValue = function (key, index, fallback) {
        if (index === void 0) { index = 0; }
        if (fallback === void 0) { fallback = null; }
        return this.parsedAttributes[key] && this.parsedAttributes[key][index] || fallback;
    };
    Tag.prototype.getTagsToBuild = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isSlot) return [3 /*break*/, 2];
                        return [4 /*yield*/, DOM_1.DOM.instance.getTagsForElements(this.delegates, true)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, [this]];
                }
            });
        });
    };
    Tag.prototype.buildAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requiresScope, defer, isMobile, tags, slot, tags_1, tags_1_1, tag, _a, _b, _i, attr, attrClass, attrObj, e_7_1;
            var e_7, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        requiresScope = false;
                        defer = false;
                        isMobile = VisionHelper_1.VisionHelper.isMobile();
                        if (this.element.offsetParent === null ||
                            this.hasAttribute('hidden') ||
                            this.hasAttribute('vsn-defer')) {
                            defer = true;
                        }
                        return [4 /*yield*/, this.getTagsToBuild()];
                    case 1:
                        tags = _d.sent();
                        slot = this.isSlot ? this : null;
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 11, 12, 13]);
                        tags_1 = __values(tags), tags_1_1 = tags_1.next();
                        _d.label = 3;
                    case 3:
                        if (!!tags_1_1.done) return [3 /*break*/, 10];
                        tag = tags_1_1.value;
                        _a = [];
                        for (_b in this.rawAttributes)
                            _a.push(_b);
                        _i = 0;
                        _d.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        attr = _a[_i];
                        if (tag.attributes.has(attr))
                            return [3 /*break*/, 7];
                        if (this.hasModifier(attr, 'mobile') && !isMobile)
                            return [3 /*break*/, 7];
                        if (this.hasModifier(attr, 'desktop') && isMobile)
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getAttributeClass(attr)];
                    case 5:
                        attrClass = _d.sent();
                        if (!attrClass) return [3 /*break*/, 7];
                        if (attrClass.scoped)
                            requiresScope = true;
                        attrObj = attrClass.create(tag, attr, attrClass, slot);
                        tag.attributes.set(attr, attrObj);
                        if (!(defer && attrClass.canDefer)) return [3 /*break*/, 7];
                        return [4 /*yield*/, attrObj.defer()];
                    case 6:
                        _d.sent();
                        tag.deferredAttributes.push(attrObj);
                        attrObj.on('state', tag.onAttributeStateChange, tag);
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 4];
                    case 8:
                        if (tag.element.getAttribute('id'))
                            requiresScope = true;
                        if (requiresScope && !tag.uniqueScope) {
                            tag._uniqueScope = true;
                        }
                        _d.label = 9;
                    case 9:
                        tags_1_1 = tags_1.next();
                        return [3 /*break*/, 3];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        e_7_1 = _d.sent();
                        e_7 = { error: e_7_1 };
                        return [3 /*break*/, 13];
                    case 12:
                        try {
                            if (tags_1_1 && !tags_1_1.done && (_c = tags_1.return)) _c.call(tags_1);
                        }
                        finally { if (e_7) throw e_7.error; }
                        return [7 /*endfinally*/];
                    case 13:
                        this._state = TagState.AttributesBuilt;
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.compileAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tags, tags_2, tags_2_1, tag, _a, _b, attr, e_8_1, e_9_1;
            var e_9, _c, e_8, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getTagsToBuild()];
                    case 1:
                        tags = _e.sent();
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 13, 14, 15]);
                        tags_2 = __values(tags), tags_2_1 = tags_2.next();
                        _e.label = 3;
                    case 3:
                        if (!!tags_2_1.done) return [3 /*break*/, 12];
                        tag = tags_2_1.value;
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 9, 10, 11]);
                        _a = (e_8 = void 0, __values(tag.getAttributesWithState(Attribute_1.AttributeState.Instantiated))), _b = _a.next();
                        _e.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 8];
                        attr = _b.value;
                        return [4 /*yield*/, attr.compile()];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_8_1 = _e.sent();
                        e_8 = { error: e_8_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_8) throw e_8.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        tags_2_1 = tags_2.next();
                        return [3 /*break*/, 3];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_9_1 = _e.sent();
                        e_9 = { error: e_9_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (tags_2_1 && !tags_2_1.done && (_c = tags_2.return)) _c.call(tags_2);
                        }
                        finally { if (e_9) throw e_9.error; }
                        return [7 /*endfinally*/];
                    case 15:
                        this._state = TagState.AttributesCompiled;
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.setupAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tags, tags_3, tags_3_1, tag, _a, _b, attr, e_10_1, e_11_1;
            var e_11, _c, e_10, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getTagsToBuild()];
                    case 1:
                        tags = _e.sent();
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 13, 14, 15]);
                        tags_3 = __values(tags), tags_3_1 = tags_3.next();
                        _e.label = 3;
                    case 3:
                        if (!!tags_3_1.done) return [3 /*break*/, 12];
                        tag = tags_3_1.value;
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 9, 10, 11]);
                        _a = (e_10 = void 0, __values(tag.getAttributesWithState(Attribute_1.AttributeState.Compiled))), _b = _a.next();
                        _e.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 8];
                        attr = _b.value;
                        return [4 /*yield*/, attr.setup()];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_10_1 = _e.sent();
                        e_10 = { error: e_10_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_10) throw e_10.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        tags_3_1 = tags_3.next();
                        return [3 /*break*/, 3];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_11_1 = _e.sent();
                        e_11 = { error: e_11_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (tags_3_1 && !tags_3_1.done && (_c = tags_3.return)) _c.call(tags_3);
                        }
                        finally { if (e_11) throw e_11.error; }
                        return [7 /*endfinally*/];
                    case 15:
                        if (!this.isSlot)
                            this.dom.registerElementInRoot(this);
                        this._state = TagState.AttributesSetup;
                        this.callOnWrapped('$setup');
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.extractAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tags, tags_4, tags_4_1, tag, _a, _b, attr, e_12_1, e_13_1;
            var e_13, _c, e_12, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getTagsToBuild()];
                    case 1:
                        tags = _e.sent();
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 13, 14, 15]);
                        tags_4 = __values(tags), tags_4_1 = tags_4.next();
                        _e.label = 3;
                    case 3:
                        if (!!tags_4_1.done) return [3 /*break*/, 12];
                        tag = tags_4_1.value;
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 9, 10, 11]);
                        _a = (e_12 = void 0, __values(tag.getAttributesWithState(Attribute_1.AttributeState.Setup))), _b = _a.next();
                        _e.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 8];
                        attr = _b.value;
                        return [4 /*yield*/, attr.extract()];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_12_1 = _e.sent();
                        e_12 = { error: e_12_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_12) throw e_12.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        tags_4_1 = tags_4.next();
                        return [3 /*break*/, 3];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_13_1 = _e.sent();
                        e_13 = { error: e_13_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (tags_4_1 && !tags_4_1.done && (_c = tags_4.return)) _c.call(tags_4);
                        }
                        finally { if (e_13) throw e_13.error; }
                        return [7 /*endfinally*/];
                    case 15:
                        this._state = TagState.AttributesExtracted;
                        this.callOnWrapped('$extracted');
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.connectAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tags, tags_5, tags_5_1, tag, _a, _b, attr, e_14_1, e_15_1;
            var e_15, _c, e_14, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getTagsToBuild()];
                    case 1:
                        tags = _e.sent();
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 13, 14, 15]);
                        tags_5 = __values(tags), tags_5_1 = tags_5.next();
                        _e.label = 3;
                    case 3:
                        if (!!tags_5_1.done) return [3 /*break*/, 12];
                        tag = tags_5_1.value;
                        if (tag.isInput) {
                            tag.addEventHandler('input', null, tag.inputMutation, tag);
                        }
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 9, 10, 11]);
                        _a = (e_14 = void 0, __values(tag.getAttributesWithState(Attribute_1.AttributeState.Extracted))), _b = _a.next();
                        _e.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 8];
                        attr = _b.value;
                        return [4 /*yield*/, attr.connect()];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_14_1 = _e.sent();
                        e_14 = { error: e_14_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_14) throw e_14.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        tags_5_1 = tags_5.next();
                        return [3 /*break*/, 3];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_15_1 = _e.sent();
                        e_15 = { error: e_15_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (tags_5_1 && !tags_5_1.done && (_c = tags_5.return)) _c.call(tags_5);
                        }
                        finally { if (e_15) throw e_15.error; }
                        return [7 /*endfinally*/];
                    case 15:
                        this._state = TagState.AttributesConnected;
                        this.callOnWrapped('$bound');
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.inputMutation = function (e) {
        var e_16, _a;
        if (this.isSelect) {
            var selected = this.element.selectedOptions;
            var values = [];
            for (var i = 0; i < selected.length; i++) {
                values.push(selected[i].value);
            }
            try {
                for (var _b = __values(Array.from(this.element.options)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var option = _c.value;
                    if (values.indexOf(option.value) > -1) {
                        option.setAttribute('selected', '');
                    }
                    else {
                        option.removeAttribute('selected');
                    }
                }
            }
            catch (e_16_1) { e_16 = { error: e_16_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_16) throw e_16.error; }
            }
            this.value = values.join(',');
        }
        else {
            this.value = e.target.value;
        }
    };
    Tag.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tags, tags_6, tags_6_1, tag, _a, _b, attr, e_17_1, e_18_1;
            var e_18, _c, e_17, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getTagsToBuild()];
                    case 1:
                        tags = _e.sent();
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 13, 14, 15]);
                        tags_6 = __values(tags), tags_6_1 = tags_6.next();
                        _e.label = 3;
                    case 3:
                        if (!!tags_6_1.done) return [3 /*break*/, 12];
                        tag = tags_6_1.value;
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 9, 10, 11]);
                        _a = (e_17 = void 0, __values(tag.getAttributesWithState(Attribute_1.AttributeState.Connected))), _b = _a.next();
                        _e.label = 5;
                    case 5:
                        if (!!_b.done) return [3 /*break*/, 8];
                        attr = _b.value;
                        return [4 /*yield*/, attr.finalize()];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_17_1 = _e.sent();
                        e_17 = { error: e_17_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_17) throw e_17.error; }
                        return [7 /*endfinally*/];
                    case 11:
                        tags_6_1 = tags_6.next();
                        return [3 /*break*/, 3];
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        e_18_1 = _e.sent();
                        e_18 = { error: e_18_1 };
                        return [3 /*break*/, 15];
                    case 14:
                        try {
                            if (tags_6_1 && !tags_6_1.done && (_c = tags_6.return)) _c.call(tags_6);
                        }
                        finally { if (e_18) throw e_18.error; }
                        return [7 /*endfinally*/];
                    case 15:
                        this._state = TagState.Built;
                        this.callOnWrapped('$built', this, this.scope, this.element);
                        this.dispatch('$built', this);
                        VisionHelper_1.VisionHelper.nice(this.setupDeferredAttributes.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.callOnWrapped = function (method) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this._uniqueScope && this.scope && this.scope.wrapped && this.scope.wrapped[method]) {
            (_a = this.scope.wrapped)[method].apply(_a, __spreadArray([], __read(args)));
            return true;
        }
        return false;
    };
    Tag.prototype.handleEvent = function (eventType, e) {
        var e_19, _a;
        var _this = this;
        if (e)
            e.stopPropagation();
        if (!this.onEventHandlers[eventType])
            return;
        this.scope.set('$event', e);
        this.scope.set('$value', this.value);
        var preventedDefault = false;
        var _loop_1 = function (handler) {
            if (!preventedDefault && handler.modifiers.has('preventdefault') && e.cancelable) {
                e.preventDefault();
                preventedDefault = true;
            }
            if (handler.modifiers.has('once'))
                this_1.removeEventHandler(handler.event, handler.handler, handler.context);
            if (handler.modifiers.has('throttle')) {
                var modifierArguments = handler.modifiers.get('throttle').getArguments(['1000']);
                var throttleTime = parseInt(modifierArguments[0]);
                var now = Math.floor(Date.now());
                if (!handler.state.lastCalled || handler.state.lastCalled + throttleTime < now) {
                    handler.state.lastCalled = now;
                }
                else {
                    return "continue";
                }
            }
            if (handler.modifiers.has('debounce')) {
                clearTimeout(handler.state.debounceTimeout);
                var modifierArguments = handler.modifiers.get('debounce').getArguments(['1000']);
                var debounceTime = parseInt(modifierArguments[0]);
                handler.state.debounceTimeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, handler.handler.call(handler.context, e)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, debounceTime);
            }
            else {
                handler.handler.call(handler.context, e);
            }
        };
        var this_1 = this;
        try {
            for (var _b = __values(this.onEventHandlers[eventType]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var handler = _c.value;
                _loop_1(handler);
            }
        }
        catch (e_19_1) { e_19 = { error: e_19_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_19) throw e_19.error; }
        }
    };
    Tag.prototype.hasModifier = function (attribute, modifier) {
        this.attributes;
        return attribute.indexOf("|" + modifier) > -1;
    };
    Tag.prototype.stripModifier = function (attribute, modifier) {
        return attribute.replace("|" + modifier, '');
    };
    Tag.prototype.getElementPath = function (element) {
        var path = [];
        var currentElement = element;
        while (currentElement) {
            var tag = currentElement.tagName;
            if (currentElement.hasAttribute('id'))
                tag += "#" + currentElement.getAttribute('id');
            else if (currentElement.hasAttribute('class'))
                tag += "." + currentElement.getAttribute('class').split(' ').join('.');
            path.push(tag);
            currentElement = currentElement.parentElement;
        }
        return path.reverse().join('>');
    };
    Tag.prototype.addEventHandler = function (eventType, modifiers, handler, context) {
        if (context === void 0) { context = null; }
        var passiveValue = null;
        modifiers = modifiers || new Modifiers_1.Modifiers();
        if (modifiers.has('active')) {
            passiveValue = false;
        }
        else if (modifiers.has('passive')) {
            passiveValue = true;
        }
        if (!this.onEventHandlers[eventType]) {
            this.onEventHandlers[eventType] = [];
            var element = On_1.On.WindowEvents.indexOf(eventType) > -1 && window ? window : this.element;
            var eventListenerOpts = {};
            if (eventType.indexOf('touch') > -1 || passiveValue !== null)
                eventListenerOpts['passive'] = passiveValue === null && true || passiveValue;
            element.addEventListener(eventType, this.handleEvent.bind(this, eventType), eventListenerOpts);
        }
        this.onEventHandlers[eventType].push({
            handler: handler,
            event: eventType,
            context: context,
            modifiers: modifiers,
            state: {}
        });
    };
    Tag.prototype.removeEventHandler = function (eventType, handler, context) {
        if (context === void 0) { context = null; }
        if (!this.onEventHandlers[eventType])
            return;
        var _handler = this.onEventHandlers[eventType].find(function (h) { return h.handler === handler && h.context === context; });
        if (_handler) {
            this.onEventHandlers[eventType].splice(this.onEventHandlers[eventType].indexOf(_handler), 1);
            if (this.onEventHandlers[eventType].length === 0) {
                this.element.removeEventListener(eventType, this.handleEvent.bind(this, eventType));
            }
        }
    };
    Tag.prototype.removeAllEventHandlers = function () {
        var e_20, _a, e_21, _b;
        try {
            for (var _c = __values(Object.keys(this.onEventHandlers)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var eventType = _d.value;
                try {
                    for (var _e = (e_21 = void 0, __values(this.onEventHandlers[eventType])), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var handler = _f.value;
                        this.removeEventHandler(eventType, handler.handler, handler.context);
                    }
                }
                catch (e_21_1) { e_21 = { error: e_21_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_21) throw e_21.error; }
                }
            }
        }
        catch (e_20_1) { e_20 = { error: e_20_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_20) throw e_20.error; }
        }
    };
    Tag.prototype.removeContextEventHandlers = function (context) {
        var e_22, _a, e_23, _b;
        try {
            for (var _c = __values(Object.keys(this.onEventHandlers)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var eventType = _d.value;
                try {
                    for (var _e = (e_23 = void 0, __values(this.onEventHandlers[eventType])), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var handler = _f.value;
                        if (handler.context === context) {
                            this.removeEventHandler(eventType, handler.handler, context);
                        }
                    }
                }
                catch (e_23_1) { e_23 = { error: e_23_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_23) throw e_23.error; }
                }
            }
        }
        catch (e_22_1) { e_22 = { error: e_22_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_22) throw e_22.error; }
        }
    };
    Tag.prototype.createScope = function (force) {
        if (force === void 0) { force = false; }
        // Standard attribute requires a unique scope
        // @todo: Does this cause any issues with attribute bindings on the parent scope prior to having its own scope? hmm...
        if (!this._scope && (force || this.uniqueScope)) {
            this._uniqueScope = true;
            this._scope = new Scope_1.Scope();
            if (this.parentTag) {
                this.scope.parentScope = this.parentTag.scope;
            }
        }
        return this._scope;
    };
    Tag.prototype.watchAttribute = function (attributeName) {
        return __awaiter(this, void 0, void 0, function () {
            var standardAttribute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.attributes.has(attributeName) && this.attributes.get(attributeName) instanceof StandardAttribute_1.StandardAttribute) {
                            return [2 /*return*/, this.attributes.get(attributeName)];
                        }
                        this.createScope(true);
                        standardAttribute = new StandardAttribute_1.StandardAttribute(this, attributeName);
                        this.attributes.set(attributeName, standardAttribute);
                        return [4 /*yield*/, this.setupAttribute(standardAttribute)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, standardAttribute];
                }
            });
        });
    };
    Tag.prototype.watchStyle = function (styleName) {
        return __awaiter(this, void 0, void 0, function () {
            var styleAttribute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.attributes.has('style'))
                            return [2 /*return*/, this.attributes.get('style')];
                        this.createScope(true);
                        styleAttribute = new StyleAttribute_1.StyleAttribute(this, 'style');
                        this.attributes.set('style', styleAttribute);
                        return [4 /*yield*/, this.setupAttribute(styleAttribute)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, styleAttribute];
                }
            });
        });
    };
    Tag.prototype.setupAttribute = function (attribute) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, attribute.compile()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, attribute.setup()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, attribute.extract()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, attribute.connect()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.setupDeferredAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, attr, e_24_1;
            var e_24, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.deferredAttributes), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        attr = _b.value;
                        return [4 /*yield*/, this.setupAttribute(attr)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_24_1 = _d.sent();
                        e_24 = { error: e_24_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_24) throw e_24.error; }
                        return [7 /*endfinally*/];
                    case 7:
                        this.deferredAttributes.length = 0;
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.deconstruct = function () {
        this.removeAllEventHandlers();
        this.attributes.forEach(function (attr) { return attr.deconstruct(); });
        this.attributes.clear();
        this._children.forEach(function (child) { return child.deconstruct(); });
        this._children.length = 0;
        if (this._controller) {
            this._controller.deconstruct();
            this._controller = null;
        }
        if (this.element) {
            this.element[Tag.TaggedVariable] = null;
            this.element = null;
        }
        _super.prototype.deconstruct.call(this);
    };
    Tag.TaggedVariable = '_vsn_tag';
    Tag.magicAttributes = [
        '@text',
        '@html',
        '@class',
        '@value',
        '@disabled',
        '@hidden',
        '@selected',
        '@readonly',
        '@multiple',
        '@required',
        '@autofocus',
    ];
    Tag.flagAttributes = [
        '@disabled',
        '@hidden',
        '@checked',
        '@selected',
        '@readonly',
        '@multiple',
        '@required',
        '@autofocus',
    ];
    return Tag;
}(DOMObject_1.DOMObject));
exports.Tag = Tag;
//# sourceMappingURL=Tag.js.map