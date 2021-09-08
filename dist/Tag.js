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
exports.Tag = exports.TagState = void 0;
var Scope_1 = require("./Scope");
var Attribute_1 = require("./Attribute");
var VisionHelper_1 = require("./helpers/VisionHelper");
var StandardAttribute_1 = require("./attributes/StandardAttribute");
var On_1 = require("./attributes/On");
var Registry_1 = require("./Registry");
var Bencmark_1 = require("./Bencmark");
var DOMObject_1 = require("./DOM/DOMObject");
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
        var _this = _super.call(this, props) || this;
        _this.element = element;
        _this.dom = dom;
        _this.deferredAttributes = [];
        _this._nonDeferredAttributes = [];
        _this._children = [];
        _this.inputTags = [
            'input',
            'select',
            'textarea'
        ];
        _this.rawAttributes = {};
        _this.parsedAttributes = {};
        _this.attributes = [];
        _this.onEventHandlers = {};
        _this.analyzeElementAttributes();
        _this._state = TagState.Instantiated;
        if (VisionHelper_1.VisionHelper.window) {
            if (!VisionHelper_1.VisionHelper.window['Tags']) {
                VisionHelper_1.VisionHelper.window['Tags'] = [];
                VisionHelper_1.VisionHelper.window['Attributes'] = [];
            }
            VisionHelper_1.VisionHelper.window['Tags'].push(_this);
        }
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
    Tag.prototype.onAttributeStateChange = function (event) {
        if (event.previouseState === Attribute_1.AttributeState.Deferred)
            this._nonDeferredAttributes.length = 0;
    };
    Object.defineProperty(Tag.prototype, "nonDeferredAttributes", {
        get: function () {
            if (this._nonDeferredAttributes.length > 0)
                return this._nonDeferredAttributes;
            var attrs = [];
            for (var _i = 0, _a = this.attributes; _i < _a.length; _i++) {
                var attribute = _a[_i];
                if (attribute.state === Attribute_1.AttributeState.Deferred)
                    continue;
                attrs.push(attribute);
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
    Tag.prototype.evaluate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, attr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.nonDeferredAttributes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        attr = _a[_i];
                        return [4 /*yield*/, attr.evaluate()];
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
    Tag.prototype.mutate = function (mutation) {
        for (var _i = 0, _a = this.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            attr.mutate(mutation);
        }
        this.trigger('mutate', mutation);
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
    Tag.prototype.getAttributeModifiers = function (attr) {
        return attr.split('|').splice(1);
    };
    Object.defineProperty(Tag.prototype, "isInput", {
        get: function () {
            return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "value", {
        get: function () {
            if (this.isInput) {
                return this.element.value;
            }
            else {
                return this.element.textContent;
            }
        },
        set: function (value) {
            if (this.isInput) {
                this.element.setAttribute('value', value);
                this.element.value = value;
            }
            else {
                this.element.innerText = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Tag.prototype.addChild = function (tag) {
        this._children.push(tag);
    };
    Object.defineProperty(Tag.prototype, "children", {
        get: function () {
            return __spreadArray([], this._children);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "parentTag", {
        get: function () {
            return this._parentTag;
        },
        set: function (tag) {
            if (this.element === document.body)
                return;
            this._parentTag = tag;
            tag.addChild(this);
            if (this.scope !== tag.scope)
                this.scope.parentScope = tag.scope;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "scope", {
        get: function () {
            if (!!this._scope)
                return this._scope;
            if (!!this._parentTag)
                return this._parentTag.scope;
            return null;
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
        this.scope.wrap(obj, triggerUpdates, updateFromWrapped);
        obj['$scope'] = this.scope;
        obj['$tag'] = this;
        obj['$el'] = this.element;
        return obj;
    };
    Tag.prototype.unwrap = function () {
        this.scope.unwrap();
    };
    Tag.prototype.removeFromDOM = function () {
        this.element.remove();
    };
    Tag.prototype.addToParentElement = function () {
        this._parentTag.element.appendChild(this.element);
    };
    Tag.prototype.hide = function () {
        this.element.hidden = true;
    };
    Tag.prototype.show = function () {
        this.element.hidden = false;
    };
    Tag.prototype.findAncestorByAttribute = function (attr) {
        if (this.hasAttribute(attr))
            return this;
        return this.parentTag ? this.parentTag.findAncestorByAttribute(attr) : null;
    };
    Tag.prototype.hasAttribute = function (attr) {
        return !!this.parsedAttributes[attr];
    };
    Tag.prototype.getAttribute = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var cls, _i, _a, attr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Registry_1.Registry.instance.attributes.get(key)];
                    case 1:
                        cls = _b.sent();
                        if (!cls)
                            return [2 /*return*/];
                        for (_i = 0, _a = this.attributes; _i < _a.length; _i++) {
                            attr = _a[_i];
                            if (attr instanceof cls)
                                return [2 /*return*/, attr];
                        }
                        return [2 /*return*/];
                }
            });
        });
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
    Tag.prototype.buildAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requiresScope, defer, isMobile, _a, _b, _i, attr, attrClass, attrObj;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        requiresScope = false;
                        defer = false;
                        this.attributes.length = 0;
                        isMobile = VisionHelper_1.VisionHelper.isMobile();
                        if (this.element.offsetParent === null ||
                            this.hasAttribute('hidden') ||
                            this.hasAttribute('vsn-defer')) {
                            defer = true;
                        }
                        _a = [];
                        for (_b in this.rawAttributes)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        attr = _a[_i];
                        if (this.hasModifier(attr, 'mobile')) {
                            if (!isMobile) {
                                return [3 /*break*/, 4];
                            }
                        }
                        if (this.hasModifier(attr, 'desktop')) {
                            if (isMobile) {
                                return [3 /*break*/, 4];
                            }
                        }
                        return [4 /*yield*/, this.getAttributeClass(attr)];
                    case 2:
                        attrClass = _c.sent();
                        if (!attrClass) return [3 /*break*/, 4];
                        if (attrClass.scoped)
                            requiresScope = true;
                        attrObj = new attrClass(this, attr);
                        this.attributes.push(attrObj);
                        if (!(defer && attrClass.canDefer)) return [3 /*break*/, 4];
                        return [4 /*yield*/, attrObj.defer()];
                    case 3:
                        _c.sent();
                        this.deferredAttributes.push(attrObj);
                        attrObj.bind('state', this.onAttributeStateChange.bind(this));
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        if (this.element.getAttribute('id'))
                            requiresScope = true;
                        if (requiresScope && !this.uniqueScope) {
                            this._uniqueScope = true;
                            this._scope = new Scope_1.Scope();
                        }
                        this._state = TagState.AttributesBuilt;
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.compileAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, attr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.nonDeferredAttributes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        attr = _a[_i];
                        return [4 /*yield*/, attr.compile()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this._state = TagState.AttributesCompiled;
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.setupAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, attr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (VisionHelper_1.VisionHelper.doBenchmark)
                            Bencmark_1.benchmarkStart('Tag.setupAttributes');
                        _i = 0, _a = this.nonDeferredAttributes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        attr = _a[_i];
                        return [4 /*yield*/, attr.setup()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        if (VisionHelper_1.VisionHelper.doBenchmark)
                            Bencmark_1.benchmarkEnd('Tag.setupAttributes', 'Attribute.setup');
                        this.dom.registerElementInRoot(this);
                        if (VisionHelper_1.VisionHelper.doBenchmark)
                            Bencmark_1.benchmarkEnd('Tag.setupAttributes', 'register');
                        this._state = TagState.AttributesSetup;
                        this.callOnWrapped('$setup');
                        if (VisionHelper_1.VisionHelper.doBenchmark)
                            Bencmark_1.benchmarkEnd('Tag.setupAttributes', '$setup');
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.extractAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, attr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.nonDeferredAttributes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        attr = _a[_i];
                        return [4 /*yield*/, attr.extract()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this._state = TagState.AttributesExtracted;
                        this.callOnWrapped('$extracted');
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.connectAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, attr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isInput) {
                            this.addEventHandler('input', [], this.inputMutation.bind(this));
                        }
                        _i = 0, _a = this.nonDeferredAttributes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        attr = _a[_i];
                        return [4 /*yield*/, attr.connect()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this._state = TagState.AttributesConnected;
                        this.callOnWrapped('$bound');
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.inputMutation = function (e) {
        this.element.setAttribute('value', e.target.value);
    };
    Tag.prototype.finalize = function () {
        this._state = TagState.Built;
        this.callOnWrapped('$built', this, this.scope, this.element);
        VisionHelper_1.VisionHelper.nice(this.setupDeferredAttributes.bind(this));
    };
    Tag.prototype.callOnWrapped = function (method) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this._uniqueScope && this.scope && this.scope.wrapped && this.scope.wrapped[method]) {
            (_a = this.scope.wrapped)[method].apply(_a, args);
            return true;
        }
        return false;
    };
    Tag.prototype.handleEvent = function (eventType, e) {
        if (e)
            e.stopPropagation();
        if (!this.onEventHandlers[eventType])
            return;
        this.scope.set('$event', e);
        this.scope.set('$value', this.value);
        for (var _i = 0, _a = this.onEventHandlers[eventType]; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler(e);
        }
    };
    Tag.prototype.hasModifier = function (attribute, modifier) {
        return attribute.indexOf("|" + modifier) > -1;
    };
    Tag.prototype.stripModifier = function (attribute, modifier) {
        return attribute.replace("|" + modifier, '');
    };
    Tag.prototype.addEventHandler = function (eventType, modifiers, handler) {
        var passiveValue = null;
        if (modifiers.indexOf('active') > -1) {
            passiveValue = false;
        }
        else if (modifiers.indexOf('passive') > -1) {
            passiveValue = true;
        }
        if (!this.onEventHandlers[eventType]) {
            this.onEventHandlers[eventType] = [];
            var element = On_1.On.WindowEvents.indexOf(eventType) > -1 && window ? window : this.element;
            var opts = {};
            if (eventType.indexOf('touch') > -1 || passiveValue !== null)
                opts['passive'] = passiveValue === null && true || passiveValue;
            element.addEventListener(eventType, this.handleEvent.bind(this, eventType), opts);
        }
        this.onEventHandlers[eventType].push(handler);
    };
    Tag.prototype.watchAttribute = function (attributeName) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, attribute, standardAttribute;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        for (_i = 0, _a = this.attributes; _i < _a.length; _i++) {
                            attribute = _a[_i];
                            if (attribute instanceof StandardAttribute_1.StandardAttribute && attribute.attributeName == attributeName) {
                                return [2 /*return*/, attribute];
                            }
                        }
                        // Standard attribute requires a unique scope
                        // @todo: Does this cause any issues with attribute bindings on the parent scope prior to having its own scope? hmm...
                        if (!this.uniqueScope) {
                            this._uniqueScope = true;
                            this._scope = new Scope_1.Scope();
                            if (this.parentTag) {
                                this.scope.parentScope = this.parentTag.scope;
                            }
                        }
                        standardAttribute = new StandardAttribute_1.StandardAttribute(this, attributeName);
                        this.attributes.push(standardAttribute);
                        return [4 /*yield*/, this.setupAttribute(standardAttribute)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, standardAttribute];
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
            var _i, _a, attr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.deferredAttributes;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        attr = _a[_i];
                        return [4 /*yield*/, this.setupAttribute(attr)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.deferredAttributes.length = 0;
                        return [2 /*return*/];
                }
            });
        });
    };
    return Tag;
}(DOMObject_1.DOMObject));
exports.Tag = Tag;
//# sourceMappingURL=Tag.js.map