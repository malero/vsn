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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.List = void 0;
var Attribute_1 = require("../Attribute");
var Tag_1 = require("../Tag");
var WrappedArray_1 = require("../Scope/WrappedArray");
var ElementHelper_1 = require("../helpers/ElementHelper");
var Registry_1 = require("../Registry");
var DOM_1 = require("../DOM");
var Scope_1 = require("../Scope");
var ScopeData_1 = require("../Scope/ScopeData");
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    List_1 = List;
    List.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var template, templateTag, templateNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.tag.element.children.length > 0)) return [3 /*break*/, 2];
                        template = this.tag.element.children[0];
                        return [4 /*yield*/, this.tag.dom.getTagForElement(template)];
                    case 1:
                        templateTag = _a.sent();
                        if (template) {
                            if (template.hasAttribute('vsn-template')) {
                                templateTag.parentTag = this.tag; // Set parentTag before removing from DOM
                                template.removeAttribute('vsn-template');
                                this.tag.element.removeChild(template);
                                this.template = template;
                            }
                            else {
                                this.template = template.cloneNode(true);
                            }
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        if (!this.tag.hasRawAttribute('template')) return [3 /*break*/, 4];
                        return [4 /*yield*/, DOM_1.DOM.instance.exec(this.tag.getRawAttributeValue('template'))];
                    case 3:
                        templateNode = _a.sent();
                        if (templateNode instanceof Array && templateNode.length === 1)
                            templateNode = templateNode[0];
                        this.template = templateNode.element.content.cloneNode(true);
                        _a.label = 4;
                    case 4: return [4 /*yield*/, _super.prototype.setup.call(this)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    List.prototype.extract = function () {
        return __awaiter(this, void 0, void 0, function () {
            var listAttr, ref, listScope, listKey, items, toAdd, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listAttr = this.getAttributeBinding('items');
                        ref = this.tag.scope.getReference(listAttr);
                        return [4 /*yield*/, ref.getScope()];
                    case 1:
                        listScope = _a.sent();
                        return [4 /*yield*/, ref.getKey()];
                    case 2:
                        listKey = _a.sent();
                        items = listScope.get(listKey);
                        return [4 /*yield*/, this.addExistingItems(items)];
                    case 3:
                        _a.sent();
                        listScope.on("change:" + listKey, function (e) {
                            if (e === null || e === void 0 ? void 0 : e.oldValue) {
                                if (e.oldValue instanceof WrappedArray_1.WrappedArray) {
                                    e.oldValue.map(function (item) {
                                        _this.remove(item);
                                    });
                                    e.oldValue.offWithContext('add', _this);
                                    e.oldValue.offWithContext('remove', _this);
                                }
                                _this.addExistingItems(e.value);
                            }
                        });
                        if (!this.tag.hasRawAttribute('initial-items')) return [3 /*break*/, 7];
                        toAdd = parseInt(this.tag.getRawAttributeValue('initial-items'));
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < toAdd)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.add({})];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7: return [4 /*yield*/, _super.prototype.extract.call(this)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    List.prototype.addExistingItems = function (defaultList) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _i, _b, tag, _c, defaultList_1, existingItem, _d, _e, element, tag;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        this.items = defaultList || new WrappedArray_1.WrappedArray();
                        if (((_a = this.tags) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                            for (_i = 0, _b = this.tags; _i < _b.length; _i++) {
                                tag = _b[_i];
                                tag.deconstruct();
                                tag.removeFromDOM();
                            }
                        }
                        this.tags = this.tags || [];
                        this.tags.length = 0;
                        if (!defaultList) return [3 /*break*/, 4];
                        _c = 0, defaultList_1 = defaultList;
                        _f.label = 1;
                    case 1:
                        if (!(_c < defaultList_1.length)) return [3 /*break*/, 4];
                        existingItem = defaultList_1[_c];
                        return [4 /*yield*/, this.add(existingItem)];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        _c++;
                        return [3 /*break*/, 1];
                    case 4:
                        _d = 0, _e = Array.from(this.tag.element.querySelectorAll('*'));
                        _f.label = 5;
                    case 5:
                        if (!(_d < _e.length)) return [3 /*break*/, 8];
                        element = _e[_d];
                        if (!ElementHelper_1.ElementHelper.hasVisionAttribute(element, 'vsn-list-item'))
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, this.tag.dom.getTagForElement(element)];
                    case 6:
                        tag = _f.sent();
                        if (tag) {
                            this.tags.push(tag);
                            this.items.push(tag.scope.wrapped || tag.scope);
                        }
                        _f.label = 7;
                    case 7:
                        _d++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!(this.items instanceof WrappedArray_1.WrappedArray)) {
                            this.items = new WrappedArray_1.WrappedArray(this.items);
                        }
                        this.items.on('add', this.add, this);
                        this.items.on('remove', this.remove, this);
                        this.tag.scope.set('add', this.add.bind(this));
                        this.tag.scope.set('remove', this.remove.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(List.prototype, "listItemName", {
        get: function () {
            return this.tag.getRawAttributeValue('list-item-name', 'item');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(List.prototype, "listItemModel", {
        get: function () {
            return this.tag.getRawAttributeValue('list-item-model');
        },
        enumerable: false,
        configurable: true
    });
    List.prototype.remove = function (item) {
        for (var i = 0; i < this.tags.length; i++) {
            var tag = this.tags[i];
            var listItem = tag.scope.get(this.listItemName);
            if ([listItem, listItem.data, listItem.wrapped].indexOf(item) > -1) {
                tag.deconstruct();
                tag.removeFromDOM();
                this.tags.splice(i, 1);
                return;
            }
        }
    };
    List.prototype.add = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var clone, element, data, tag, itemScope;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clone = this.template.cloneNode(true);
                        if (clone instanceof DocumentFragment) {
                            element = clone.children[0];
                        }
                        else {
                            element = clone;
                        }
                        delete element[Tag_1.Tag.TaggedVariable];
                        if (obj instanceof ScopeData_1.ScopeData)
                            data = obj.getData();
                        else
                            data = Object.assign({}, obj);
                        return [4 /*yield*/, this.tag.dom.buildTag(element, true)];
                    case 1:
                        tag = _a.sent();
                        return [4 /*yield*/, this.setupTagScope(tag, obj)];
                    case 2:
                        _a.sent();
                        // Add to DOM & build
                        this.tag.element.appendChild(element);
                        return [4 /*yield*/, this.tag.dom.setupTags([tag])];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.tag.dom.buildFrom(this.tag.element)];
                    case 4:
                        _a.sent();
                        itemScope = tag.scope.get(this.listItemName);
                        if (itemScope instanceof Scope_1.Scope && data) {
                            itemScope.data.setData(data);
                        }
                        this.tags.push(tag);
                        this.tag.dispatch('add', obj);
                        return [2 /*return*/];
                }
            });
        });
    };
    List.prototype.setupTagScope = function (tag, obj) {
        return __awaiter(this, void 0, void 0, function () {
            var itemScope, modelName, cls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (tag.meta[List_1.MetaItemSetupFlag])
                            return [2 /*return*/];
                        tag.createScope(true);
                        itemScope = new Scope_1.Scope(tag.scope);
                        modelName = this.listItemModel;
                        if (!modelName) return [3 /*break*/, 2];
                        return [4 /*yield*/, Registry_1.Registry.instance.models.get(modelName)];
                    case 1:
                        cls = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (cls) {
                            if (!obj || !(obj instanceof cls)) {
                                obj = new cls(obj);
                            }
                        }
                        // Check if the class is set up already
                        if (!cls || (!(itemScope.data instanceof cls) && !(itemScope.wrapped instanceof cls))) {
                            if (itemScope.wrapped)
                                itemScope.unwrap();
                            itemScope.wrap(obj, true, true);
                        }
                        tag.scope.set(this.listItemName, itemScope);
                        tag.meta[List_1.MetaItemSetupFlag] = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    var List_1;
    List.MetaItemSetupFlag = 'vsn-list-item-setup';
    List.canDefer = false;
    List.scoped = true;
    List = List_1 = __decorate([
        Registry_1.Registry.attribute('vsn-list')
    ], List);
    return List;
}(Attribute_1.Attribute));
exports.List = List;
//# sourceMappingURL=List.js.map