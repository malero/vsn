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
var Scope_1 = require("../Scope");
var AST_1 = require("../AST");
var ElementHelper_1 = require("../helpers/ElementHelper");
var Registry_1 = require("../Registry");
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    List.prototype.compile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var listAttr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listAttr = this.getAttributeBinding();
                        this.tree = new AST_1.Tree(listAttr);
                        return [4 /*yield*/, this.tree.prepare(this.tag.scope, this.tag.dom)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    List.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var template;
            return __generator(this, function (_a) {
                if (this.tag.element.children.length > 0) {
                    template = this.tag.element.children[0];
                    if (template.hasAttribute('vsn-template')) {
                        template.removeAttribute('vsn-template');
                        this.tag.element.removeChild(template);
                        this.template = template;
                    }
                    else {
                        this.template = template.cloneNode(true);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    List.prototype.extract = function () {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.tree.evaluate(this.tag.scope, this.tag.dom)];
                    case 1:
                        items = _a.sent();
                        return [4 /*yield*/, this.addExistingItems(items)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    List.prototype.addExistingItems = function (defaultList) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, defaultList_1, existingItem, _a, _b, element, tag;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.items = defaultList || new Scope_1.WrappedArray();
                        this.tags = [];
                        if (!defaultList) return [3 /*break*/, 4];
                        _i = 0, defaultList_1 = defaultList;
                        _c.label = 1;
                    case 1:
                        if (!(_i < defaultList_1.length)) return [3 /*break*/, 4];
                        existingItem = defaultList_1[_i];
                        return [4 /*yield*/, this.add(existingItem)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _a = 0, _b = Array.from(this.tag.element.querySelectorAll('*'));
                        _c.label = 5;
                    case 5:
                        if (!(_a < _b.length)) return [3 /*break*/, 8];
                        element = _b[_a];
                        if (!ElementHelper_1.ElementHelper.hasVisionAttribute(element, 'vsn-list-item'))
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, this.tag.dom.getTagForElement(element)];
                    case 6:
                        tag = _c.sent();
                        if (tag) {
                            this.tags.push(tag);
                            this.items.push(tag.scope.wrapped || tag.scope);
                        }
                        _c.label = 7;
                    case 7:
                        _a++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!(this.items instanceof Scope_1.WrappedArray)) {
                            this.items = new Scope_1.WrappedArray(this.items);
                        }
                        this.items.bind('add', function (item) {
                            _this.add(item);
                        });
                        this.items.bind('remove', function (item) {
                            _this.remove(item);
                        });
                        this.tag.scope.set('add', this.add.bind(this));
                        this.tag.scope.set('remove', this.remove.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(List.prototype, "listItemName", {
        get: function () {
            return this.tag.getRawAttributeValue('vsn-list-item-name', 'item');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(List.prototype, "listItemModel", {
        get: function () {
            return this.tag.getRawAttributeValue('vsn-list-item-model', 'Object');
        },
        enumerable: false,
        configurable: true
    });
    List.prototype.remove = function (item) {
        for (var i = 0; i < this.tags.length; i++) {
            var tag = this.tags[i];
            var listItem = tag.scope.get(this.listItemName);
            if ([listItem, listItem.wrapped].indexOf(item) > -1) {
                tag.removeFromDOM();
                this.tags.splice(i, 1);
                return;
            }
        }
    };
    List.prototype.add = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var element, tag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        element = this.template.cloneNode(true);
                        this.tag.element.appendChild(element);
                        return [4 /*yield*/, this.tag.dom.buildFrom(this.tag.element)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.tag.dom.getTagForElement(element)];
                    case 2:
                        tag = _a.sent();
                        this.tags.push(tag);
                        tag.scope.clear();
                        if (obj) {
                            tag.unwrap();
                            tag.wrap(obj);
                        }
                        this.tag.trigger('add', obj);
                        return [2 /*return*/];
                }
            });
        });
    };
    List.canDefer = false;
    List.scoped = true;
    List = __decorate([
        Registry_1.Registry.attribute('vsn-list')
    ], List);
    return List;
}(Attribute_1.Attribute));
exports.List = List;
//# sourceMappingURL=List.js.map