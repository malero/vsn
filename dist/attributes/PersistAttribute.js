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
exports.PersistAttribute = void 0;
var Registry_1 = require("../Registry");
var Attribute_1 = require("../Attribute");
var Tag_1 = require("../Tag");
var PersistAttribute = /** @class */ (function (_super) {
    __extends(PersistAttribute, _super);
    function PersistAttribute() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.valueKeys = [];
        return _this;
    }
    PersistAttribute_1 = PersistAttribute;
    PersistAttribute.prototype.extract = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.valueKeys = this.getAttributeValue().split(' ').map(function (v) { return v.trim(); }).filter(function (v) { return v.length > 0; });
                        return [4 /*yield*/, _super.prototype.extract.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PersistAttribute.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var elementId, persistedValues, _a, _b, key, classes;
            var e_1, _c, _d, _e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        elementId = this.tag.element.id;
                        if (!elementId)
                            throw new Error('vsn-persist requires an id attribute on the element');
                        persistedValues = PersistAttribute_1.getPersistedValueStore(elementId);
                        try {
                            for (_a = __values(this.valueKeys), _b = _a.next(); !_b.done; _b = _a.next()) {
                                key = _b.value;
                                if (persistedValues.has(key)) {
                                    if (key === '@class') {
                                        classes = persistedValues.get(key);
                                        (_d = this.tag.element.classList).remove.apply(_d, __spreadArray([], __read(Array.from(this.tag.element.classList))));
                                        (_e = this.tag.element.classList).add.apply(_e, __spreadArray([], __read(classes)));
                                    }
                                    else if (key.startsWith('@')) {
                                        this.tag.element.setAttribute(key.substring(1), persistedValues.get(key));
                                        if (this.tag.isInput) {
                                            this.tag.once('$built', function () {
                                                _this.tag.element.dispatchEvent(new Event('input'));
                                            });
                                        }
                                    }
                                    else {
                                    }
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [4 /*yield*/, _super.prototype.connect.call(this)];
                    case 1:
                        _f.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PersistAttribute.prototype.mutate = function (mutation) {
        if (this.tag.state !== Tag_1.TagState.Built)
            return;
        this.updateFrom();
    };
    PersistAttribute.prototype.updateFrom = function () {
        var e_2, _a;
        var elementId = this.tag.element.id;
        var persistedValues = PersistAttribute_1.getPersistedValueStore(elementId);
        try {
            for (var _b = __values(this.valueKeys), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (key === '@class') {
                    var classes = Array.from(this.tag.element.classList);
                    persistedValues.set(key, classes);
                }
                else if (key.startsWith('@')) {
                    persistedValues.set(key, this.tag.element.getAttribute(key.substring(1)));
                    if (this.tag.isInput) {
                        this.tag.dispatch('input');
                    }
                }
                else {
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
    };
    PersistAttribute.getPersistedValueStore = function (elementId) {
        if (!PersistAttribute_1.persistedValues.has(elementId))
            PersistAttribute_1.persistedValues.set(elementId, new Map());
        return PersistAttribute_1.persistedValues.get(elementId);
    };
    var PersistAttribute_1;
    PersistAttribute.persistedValues = new Map();
    PersistAttribute.canDefer = true;
    PersistAttribute = PersistAttribute_1 = __decorate([
        Registry_1.Registry.attribute('vsn-persist')
    ], PersistAttribute);
    return PersistAttribute;
}(Attribute_1.Attribute));
exports.PersistAttribute = PersistAttribute;
//# sourceMappingURL=PersistAttribute.js.map