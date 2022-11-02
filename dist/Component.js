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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
var Registry_1 = require("./Registry");
var DOM_1 = require("./DOM");
var SlotTag_1 = require("./Tag/SlotTag");
var SlottedTag_1 = require("./Tag/SlottedTag");
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component() {
        var e_1, _a;
        var _this = _super.call(this) || this;
        Object.setPrototypeOf(_this, Component.prototype);
        _this.shadow = _this.attachShadow({ mode: 'open' });
        var templateId = _this.getAttribute('template');
        var template;
        if (templateId) {
            template = document.getElementById(templateId);
        }
        else {
            template = Registry_1.Registry.instance.templates.getSynchronous(_this.tagName.toLowerCase());
        }
        _this.setAttribute('vsn-scope', '');
        _this.shadow.appendChild(template.content.cloneNode(true));
        try {
            for (var _b = __values(Array.from(_this.shadow.children)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child['shadowParent'] = _this;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var slotPromises = [];
        var tagsToSetup = [];
        _this.shadow.querySelectorAll('slot').forEach(function (slot) {
            var slotTagPromise = DOM_1.DOM.instance.buildTag(slot, false, SlotTag_1.SlotTag);
            var promise = new Promise(function (resolve, reject) {
                slot.addEventListener('slotchange', function (e) {
                    slotTagPromise.then(function (slotTag) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b, child, t, e_2_1;
                        var e_2, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 6, 7, 8]);
                                    _a = __values(slot.assignedNodes()), _b = _a.next();
                                    _d.label = 1;
                                case 1:
                                    if (!!_b.done) return [3 /*break*/, 5];
                                    child = _b.value;
                                    return [4 /*yield*/, DOM_1.DOM.instance.buildTag(child, false, SlottedTag_1.SlottedTag)];
                                case 2:
                                    t = _d.sent();
                                    return [4 /*yield*/, (t === null || t === void 0 ? void 0 : t.slotted(slotTag))];
                                case 3:
                                    _d.sent();
                                    tagsToSetup.push(t);
                                    _d.label = 4;
                                case 4:
                                    _b = _a.next();
                                    return [3 /*break*/, 1];
                                case 5: return [3 /*break*/, 8];
                                case 6:
                                    e_2_1 = _d.sent();
                                    e_2 = { error: e_2_1 };
                                    return [3 /*break*/, 8];
                                case 7:
                                    try {
                                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                    return [7 /*endfinally*/];
                                case 8:
                                    resolve(slotTag);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
            });
            slotPromises.push(promise);
        });
        Promise.all(slotPromises).then(function (slotTags) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DOM_1.DOM.instance.buildFrom(this, false, true)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, DOM_1.DOM.instance.setupTags(slotTags)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, DOM_1.DOM.instance.setupTags(tagsToSetup)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return _this;
    }
    Component.prototype.connectedCallback = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DOM_1.DOM.instance.buildTag(this, true)];
                    case 1:
                        tag = _a.sent();
                        tag.createScope(true);
                        return [4 /*yield*/, DOM_1.DOM.instance.buildFrom(this.shadow)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, tag.dom.resetBranch(tag)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, tag.dom.setupTags([tag])];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Component;
}(HTMLElement));
exports.Component = Component;
//# sourceMappingURL=Component.js.map