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
exports.DOM = void 0;
var Tag_1 = require("./Tag");
var ElementHelper_1 = require("./helpers/ElementHelper");
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var DOM = /** @class */ (function (_super) {
    __extends(DOM, _super);
    function DOM(document, build) {
        if (build === void 0) { build = true; }
        var _this = _super.call(this) || this;
        _this.document = document;
        _this.observer = new MutationObserver(_this.mutation.bind(_this));
        _this.tags = [];
        if (build) {
            _this.buildFrom(document);
        }
        _this.evaluate();
        return _this;
    }
    DOM.prototype.registerElementInRoot = function (tag) {
        var id = ElementHelper_1.ElementHelper.normalizeElementID(tag.element.getAttribute('id'));
        if (!!id)
            this.root.scope.set("#" + id, tag.scope);
    };
    DOM.prototype.evaluate = function () {
        clearTimeout(this.evaluateTimeout);
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            tag.evaluate();
        }
    };
    DOM.prototype.mutation = function (mutations) {
        for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
            var mutation = mutations_1[_i];
            var tag = this.getTagForElement(mutation.target);
            if (tag) {
                tag.mutate(mutation);
            }
        }
    };
    DOM.prototype.buildFrom = function (ele) {
        return __awaiter(this, void 0, void 0, function () {
            var allElements, _i, _a, tag, newTags, _b, _c, _e, element, tag, _d, newTags_1, tag, _f, newTags_2, tag, parentElement, foundParent, _g, newTags_3, tag, _h, newTags_4, tag, _j, newTags_5, tag, _k, newTags_6, tag, _l, newTags_7, tag, _m, newTags_8, tag;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        allElements = [];
                        document.body.setAttribute('vsn-root', '');
                        for (_i = 0, _a = this.tags; _i < _a.length; _i++) {
                            tag = _a[_i];
                            allElements.push(tag.element);
                        }
                        newTags = [];
                        for (_b = 0, _c = Array.from(ele.querySelectorAll("*")); _b < _c.length; _b++) {
                            _e = _c[_b];
                            element = _e;
                            if (allElements.indexOf(element) > -1)
                                continue;
                            if (ElementHelper_1.ElementHelper.hasVisionAttribute(element)) {
                                tag = new Tag_1.Tag(element, this);
                                this.tags.push(tag);
                                newTags.push(tag);
                                allElements.push(element);
                            }
                        }
                        this.root = this.getTagForElement(document.body);
                        _d = 0, newTags_1 = newTags;
                        _o.label = 1;
                    case 1:
                        if (!(_d < newTags_1.length)) return [3 /*break*/, 4];
                        tag = newTags_1[_d];
                        return [4 /*yield*/, tag.buildAttributes()];
                    case 2:
                        _o.sent();
                        _o.label = 3;
                    case 3:
                        _d++;
                        return [3 /*break*/, 1];
                    case 4:
                        for (_f = 0, newTags_2 = newTags; _f < newTags_2.length; _f++) {
                            tag = newTags_2[_f];
                            if (tag === this.root)
                                continue;
                            parentElement = tag.element.parentElement;
                            foundParent = false;
                            while (parentElement) {
                                if (allElements.indexOf(parentElement) > -1) {
                                    foundParent = true;
                                    tag.parentTag = this.getTagForElement(parentElement);
                                    break;
                                }
                                parentElement = parentElement.parentElement;
                            }
                            if (!foundParent)
                                console.error('Could not find parent for ', tag);
                        }
                        _g = 0, newTags_3 = newTags;
                        _o.label = 5;
                    case 5:
                        if (!(_g < newTags_3.length)) return [3 /*break*/, 8];
                        tag = newTags_3[_g];
                        return [4 /*yield*/, tag.setupAttributes()];
                    case 6:
                        _o.sent();
                        _o.label = 7;
                    case 7:
                        _g++;
                        return [3 /*break*/, 5];
                    case 8:
                        _h = 0, newTags_4 = newTags;
                        _o.label = 9;
                    case 9:
                        if (!(_h < newTags_4.length)) return [3 /*break*/, 12];
                        tag = newTags_4[_h];
                        return [4 /*yield*/, tag.extractAttributes()];
                    case 10:
                        _o.sent();
                        _o.label = 11;
                    case 11:
                        _h++;
                        return [3 /*break*/, 9];
                    case 12:
                        _j = 0, newTags_5 = newTags;
                        _o.label = 13;
                    case 13:
                        if (!(_j < newTags_5.length)) return [3 /*break*/, 16];
                        tag = newTags_5[_j];
                        return [4 /*yield*/, tag.connectAttributes()];
                    case 14:
                        _o.sent();
                        _o.label = 15;
                    case 15:
                        _j++;
                        return [3 /*break*/, 13];
                    case 16:
                        for (_k = 0, newTags_6 = newTags; _k < newTags_6.length; _k++) {
                            tag = newTags_6[_k];
                            this.registerElementInRoot(tag);
                        }
                        for (_l = 0, newTags_7 = newTags; _l < newTags_7.length; _l++) {
                            tag = newTags_7[_l];
                            tag.finalize();
                        }
                        for (_m = 0, newTags_8 = newTags; _m < newTags_8.length; _m++) {
                            tag = newTags_8[_m];
                            this.observer.observe(tag.element, {
                                attributes: true,
                                characterData: true,
                                childList: true,
                                subtree: true
                            });
                        }
                        this.trigger('built');
                        return [2 /*return*/];
                }
            });
        });
    };
    DOM.prototype.getTagForElement = function (element) {
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            if (tag.element === element)
                return tag;
        }
        return null;
    };
    return DOM;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.DOM = DOM;
//# sourceMappingURL=DOM.js.map