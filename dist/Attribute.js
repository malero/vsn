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
exports.Attribute = exports.AttributeState = void 0;
var EventDispatcher_1 = require("./EventDispatcher");
var Modifiers_1 = require("./Modifiers");
var AttributeState;
(function (AttributeState) {
    AttributeState[AttributeState["Instantiated"] = 0] = "Instantiated";
    AttributeState[AttributeState["Deferred"] = 1] = "Deferred";
    AttributeState[AttributeState["Compiled"] = 2] = "Compiled";
    AttributeState[AttributeState["Setup"] = 3] = "Setup";
    AttributeState[AttributeState["Extracted"] = 4] = "Extracted";
    AttributeState[AttributeState["Connected"] = 5] = "Connected";
    AttributeState[AttributeState["Built"] = 6] = "Built";
    AttributeState[AttributeState["Disconnected"] = 7] = "Disconnected";
})(AttributeState = exports.AttributeState || (exports.AttributeState = {}));
var Attribute = /** @class */ (function (_super) {
    __extends(Attribute, _super);
    function Attribute(tag, attributeName, slot) {
        var _this = _super.call(this) || this;
        _this.tag = tag;
        _this.attributeName = attributeName;
        _this.slot = slot;
        _this.modifiers = Modifiers_1.Modifiers.fromAttribute(attributeName);
        _this.configure();
        return _this;
    }
    Object.defineProperty(Attribute.prototype, "origin", {
        get: function () {
            return this.slot || this.tag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Attribute.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Attribute.prototype.defer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Deferred);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.configure = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Instantiated);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.compile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Compiled);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Setup);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.extract = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Extracted);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Connected);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Built);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Disconnected);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.evaluate = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Attribute.prototype.getAttributeValue = function (fallback) {
        if (fallback === void 0) { fallback = null; }
        return this.origin.getRawAttributeValue(this.attributeName, fallback);
    };
    Attribute.prototype.getAttributeBinding = function (fallback) {
        if (fallback === void 0) { fallback = null; }
        return this.origin.getAttributeBinding(this.attributeName) || fallback;
    };
    Attribute.prototype.getAttributeModifiers = function (fallback) {
        if (fallback === void 0) { fallback = []; }
        return this.modifiers.length && this.modifiers.names || fallback;
    };
    Attribute.prototype.getAttributeModifierArguments = function (modifier, fallback) {
        if (fallback === void 0) { fallback = []; }
        return this.modifiers.has(modifier) ? this.modifiers.get(modifier).arguments : fallback;
    };
    Attribute.prototype.hasModifier = function (mod) {
        return this.modifiers.has(mod);
    };
    Attribute.prototype.mutate = function (mutation) { };
    Object.defineProperty(Attribute.prototype, "value", {
        get: function () {
            return this.origin.element.getAttribute(this.attributeName) || '';
        },
        set: function (value) {
            this.origin.element.setAttribute(this.attributeName, value);
        },
        enumerable: false,
        configurable: true
    });
    Attribute.prototype.apply = function (fnc) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, element, e_1_1;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.origin.delegates), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        element = _b.value;
                        return [4 /*yield*/, fnc(element)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Attribute.prototype.setState = function (state) {
        var previousState = this._state;
        this._state = state;
        this.dispatch('state', {
            state: state,
            previousState: previousState,
            attribute: this
        });
    };
    Attribute.prototype.deconstruct = function () {
        this.disconnect();
        _super.prototype.deconstruct.call(this);
        this.tag = null;
        this.slot = null;
    };
    Attribute.create = function (tag, attributeName, cls, slot) {
        return new cls(tag, attributeName, slot);
    };
    Attribute.scoped = false;
    Attribute.canDefer = true;
    return Attribute;
}(EventDispatcher_1.EventDispatcher));
exports.Attribute = Attribute;
//# sourceMappingURL=Attribute.js.map