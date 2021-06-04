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
exports.Tag = exports.TagState = void 0;
var Scope_1 = require("./Scope");
var Bind_1 = require("./attributes/Bind");
var Click_1 = require("./attributes/Click");
var List_1 = require("./attributes/List");
var ListItem_1 = require("./attributes/ListItem");
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var Name_1 = require("./attributes/Name");
var If_1 = require("./attributes/If");
var ClickToggleClass_1 = require("./attributes/ClickToggleClass");
var ClickRemoveClass_1 = require("./attributes/ClickRemoveClass");
var ControllerAttribute_1 = require("./attributes/ControllerAttribute");
var ModelAttribute_1 = require("./attributes/ModelAttribute");
var VisionHelper_1 = require("./helpers/VisionHelper");
var SetAttribute_1 = require("./attributes/SetAttribute");
var RootAttribute_1 = require("./attributes/RootAttribute");
var TagState;
(function (TagState) {
    TagState[TagState["Instantiated"] = 0] = "Instantiated";
    TagState[TagState["AttributesBuilt"] = 1] = "AttributesBuilt";
    TagState[TagState["AttributesSetup"] = 2] = "AttributesSetup";
    TagState[TagState["AttributesExtracted"] = 3] = "AttributesExtracted";
    TagState[TagState["AttributesConnected"] = 4] = "AttributesConnected";
    TagState[TagState["Built"] = 5] = "Built";
})(TagState = exports.TagState || (exports.TagState = {}));
var Tag = /** @class */ (function (_super) {
    __extends(Tag, _super);
    function Tag(element, dom) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.dom = dom;
        _this._children = [];
        _this.inputTags = [
            'input',
            'select',
            'textarea'
        ];
        _this.rawAttributes = {};
        _this.parsedAttributes = {};
        _this.attributes = [];
        _this.onclickHandlers = [];
        _this.element.onclick = _this.onclick.bind(_this);
        // Build element Attributes
        for (var i = 0; i < _this.element.attributes.length; i++) {
            var a = _this.element.attributes[i];
            if (a.name.substr(0, 4) == 'vsn-') {
                _this.rawAttributes[a.name] = a.value;
                if (a.name.indexOf(':') > -1) {
                    var nameParts = a.name.split(':');
                    var values = nameParts.slice(1);
                    values.push(a.value);
                    _this.parsedAttributes[nameParts[0]] = values;
                }
                else {
                    _this.parsedAttributes[a.name] = [null, a.value];
                }
            }
        }
        _this._state = TagState.Instantiated;
        return _this;
    }
    Tag.prototype.evaluate = function () {
        for (var _i = 0, _a = this.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            attr.evaluate();
        }
    };
    Tag.prototype.mutate = function (mutation) {
        for (var _i = 0, _a = this.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            attr.mutate(mutation);
        }
        this.trigger('mutate', mutation);
    };
    Tag.prototype.getAttributeClass = function (attr) {
        attr = this.getAttributeName(attr);
        return Tag.attributeMap[attr];
    };
    Tag.prototype.getAttributeName = function (attr) {
        if (attr.indexOf(':') > -1) {
            var parts = attr.split(':');
            attr = parts[0];
        }
        return attr;
    };
    Tag.prototype.getAttributeBinding = function (attr) {
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
    Tag.prototype.addChild = function (tag) {
        this._children.push(tag);
    };
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
        set: function (scope) {
            this._scope = scope;
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
    Tag.prototype.wrap = function (obj, triggerUpdates) {
        if (triggerUpdates === void 0) { triggerUpdates = false; }
        if (VisionHelper_1.VisionHelper.isConstructor(obj)) {
            obj = new obj();
        }
        this.scope.wrap(obj, triggerUpdates);
        obj['$scope'] = this.scope;
        obj['$tag'] = this;
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
        var cls = Tag.attributeMap[key];
        if (!cls)
            return;
        for (var _i = 0, _a = this.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            if (attr instanceof cls)
                return attr;
        }
    };
    Tag.prototype.getRawAttributeValue = function (key, fallback) {
        if (fallback === void 0) { fallback = null; }
        return this.rawAttributes[key] && this.rawAttributes[key] || fallback;
    };
    Tag.prototype.getParsedAttributeValue = function (key, index, fallback) {
        if (index === void 0) { index = 0; }
        if (fallback === void 0) { fallback = null; }
        return this.parsedAttributes[key] && this.parsedAttributes[key][index] || fallback;
    };
    Tag.prototype.buildAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requiresScope, attr, attrClass, attrObj;
            return __generator(this, function (_a) {
                requiresScope = false;
                this.attributes.length = 0;
                for (attr in this.rawAttributes) {
                    attrClass = this.getAttributeClass(attr);
                    if (attrClass) {
                        if (attrClass.scoped)
                            requiresScope = true;
                        attrObj = new attrClass(this, attr);
                        this.attributes.push(attrObj);
                    }
                }
                if (this.element.getAttribute('id'))
                    requiresScope = true;
                if (requiresScope) {
                    this._scope = new Scope_1.Scope();
                }
                this._state = TagState.AttributesBuilt;
                return [2 /*return*/];
            });
        });
    };
    Tag.prototype.compileAttributes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, attr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.attributes;
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
                    case 4: return [2 /*return*/];
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
                        _i = 0, _a = this.attributes;
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
                        this.dom.registerElementInRoot(this);
                        this._state = TagState.AttributesSetup;
                        this.callOnWrapped('$onAttributesSetup');
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
                        _i = 0, _a = this.attributes;
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
                        this.callOnWrapped('$onAttributesExtracted');
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
                        _i = 0, _a = this.attributes;
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
                        this.callOnWrapped('$onAttributesConnected');
                        return [2 /*return*/];
                }
            });
        });
    };
    Tag.prototype.finalize = function () {
        this._state = TagState.Built;
        this.callOnWrapped('$onBuilt');
    };
    Tag.prototype.callOnWrapped = function (method) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.scope && this.scope.wrapped && this.scope.wrapped[method]) {
            (_a = this.scope.wrapped)[method].apply(_a, args);
            return true;
        }
        return false;
    };
    Tag.prototype.onclick = function (e) {
        this.scope.set('$event', e);
        for (var _i = 0, _a = this.onclickHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler(e);
        }
    };
    Tag.prototype.addClickHandler = function (handler) {
        this.onclickHandlers.push(handler);
    };
    Tag.attributeMap = {
        'vsn-root': RootAttribute_1.RootAttribute,
        'vsn-name': Name_1.Name,
        'vsn-controller': ControllerAttribute_1.ControllerAttribute,
        'vsn-model': ModelAttribute_1.ModelAttribute,
        'vsn-list': List_1.List,
        'vsn-list-item': ListItem_1.ListItem,
        'vsn-set': SetAttribute_1.SetAttribute,
        'vsn-bind': Bind_1.Bind,
        'vsn-click': Click_1.Click,
        'vsn-click-toggle-class': ClickToggleClass_1.ClickToggleClass,
        'vsn-click-remove-class': ClickRemoveClass_1.ClickRemoveClass,
        'vsn-if': If_1.If,
    };
    return Tag;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Tag = Tag;
//# sourceMappingURL=Tag.js.map