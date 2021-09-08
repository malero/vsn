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
exports.Attribute = exports.AttributeState = void 0;
var VisionHelper_1 = require("./helpers/VisionHelper");
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var AttributeState;
(function (AttributeState) {
    AttributeState[AttributeState["Instantiated"] = 0] = "Instantiated";
    AttributeState[AttributeState["Deferred"] = 1] = "Deferred";
    AttributeState[AttributeState["Compiled"] = 2] = "Compiled";
    AttributeState[AttributeState["Setup"] = 3] = "Setup";
    AttributeState[AttributeState["Extracted"] = 4] = "Extracted";
    AttributeState[AttributeState["Connected"] = 5] = "Connected";
    AttributeState[AttributeState["Built"] = 6] = "Built";
})(AttributeState = exports.AttributeState || (exports.AttributeState = {}));
var Attribute = /** @class */ (function (_super) {
    __extends(Attribute, _super);
    function Attribute(tag, attributeName) {
        var _this = _super.call(this) || this;
        _this.tag = tag;
        _this.attributeName = attributeName;
        _this.configure();
        if (VisionHelper_1.VisionHelper.window)
            VisionHelper_1.VisionHelper.window['Attributes'].push(_this);
        return _this;
    }
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
    ;
    Attribute.prototype.compile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Compiled);
                return [2 /*return*/];
            });
        });
    };
    ;
    Attribute.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Setup);
                return [2 /*return*/];
            });
        });
    };
    ;
    Attribute.prototype.extract = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Extracted);
                return [2 /*return*/];
            });
        });
    };
    ;
    Attribute.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Connected);
                return [2 /*return*/];
            });
        });
    };
    Attribute.prototype.evaluate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(AttributeState.Built);
                return [2 /*return*/];
            });
        });
    };
    ;
    Attribute.prototype.getAttributeValue = function (fallback) {
        if (fallback === void 0) { fallback = null; }
        return this.tag.getRawAttributeValue(this.attributeName, fallback);
    };
    Attribute.prototype.getAttributeBinding = function (fallback) {
        if (fallback === void 0) { fallback = null; }
        return this.tag.getAttributeBinding(this.attributeName) || fallback;
    };
    Attribute.prototype.getAttributeModifiers = function (fallback) {
        if (fallback === void 0) { fallback = []; }
        var modifiers = this.tag.getAttributeModifiers(this.attributeName);
        return modifiers.length && modifiers || fallback;
    };
    Attribute.prototype.hasModifier = function (mod) {
        return this.getAttributeModifiers().indexOf(mod) > -1;
    };
    Attribute.prototype.mutate = function (mutation) { };
    Object.defineProperty(Attribute.prototype, "value", {
        get: function () {
            return this.tag.element.getAttribute(this.attributeName) || '';
        },
        set: function (value) {
            this.tag.element.setAttribute(this.attributeName, value);
        },
        enumerable: false,
        configurable: true
    });
    Attribute.prototype.setState = function (state) {
        var previousState = this._state;
        this._state = state;
        this.trigger('state', {
            state: state,
            previousState: previousState,
            attribute: this
        });
    };
    Attribute.scoped = false;
    Attribute.canDefer = true;
    return Attribute;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Attribute = Attribute;
//# sourceMappingURL=Attribute.js.map