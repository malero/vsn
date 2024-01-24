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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleAttribute = void 0;
var Registry_1 = require("../Registry");
var Attribute_1 = require("../Attribute");
var Scope_1 = require("../Scope");
var StyleAttribute = /** @class */ (function (_super) {
    __extends(StyleAttribute, _super);
    function StyleAttribute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StyleAttribute.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var key, parentScope, styleKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = this.getAttributeValue() || null;
                        if (!key) return [3 /*break*/, 3];
                        this.scopeRef = this.tag.scope.getReference(key, true);
                        return [4 /*yield*/, this.scopeRef.getScope()];
                    case 1:
                        parentScope = _a.sent();
                        return [4 /*yield*/, this.scopeRef.getKey()];
                    case 2:
                        styleKey = _a.sent();
                        this.styleScope = parentScope.get(styleKey);
                        if (!this.styleScope) {
                            this.styleScope = new Scope_1.Scope(parentScope);
                            parentScope.set(styleKey, this.styleScope);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        this.styleScope = this.tag.scope;
                        _a.label = 4;
                    case 4: return [4 /*yield*/, _super.prototype.setup.call(this)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StyleAttribute.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.styleScope.on("change", this.handleEvent.bind(this));
                        return [4 /*yield*/, _super.prototype.connect.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StyleAttribute.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.styleScope.offWithContext("change", this);
                        return [4 /*yield*/, _super.prototype.disconnect.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StyleAttribute.prototype.extract = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.updateFrom();
                        this.updateTo();
                        return [4 /*yield*/, _super.prototype.extract.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StyleAttribute.prototype.updateFrom = function () {
        var toSkip = [
            'cssText',
            'getPropertyPriority',
            'getPropertyValue',
            'removeProperty',
            'setProperty',
            'length'
        ];
        for (var k in this.tag.style) {
            if (toSkip.indexOf(k) > -1 || isFinite(k))
                continue;
            var value = this.tag.style[k];
            var key = "$" + k;
            if (value && value !== this.styleScope.get(key))
                this.styleScope.set(key, value);
        }
    };
    StyleAttribute.prototype.updateTo = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.styleScope.keys), _c = _b.next(); !_c.done; _c = _b.next()) {
                var k = _c.value;
                var v = this.styleScope.get(k);
                if (k.startsWith('$')) {
                    var key = k.substr(1);
                    this.tag.element.style[key] = v.value;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    StyleAttribute.prototype.mutate = function (mutation) {
        _super.prototype.mutate.call(this, mutation);
        this.updateFrom();
    };
    StyleAttribute.prototype.handleEvent = function (k, v) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                if (k.startsWith('$')) {
                    key = k.substr(1);
                    if (v.value !== v.previousValue) {
                        this.tag.element.style[key] = v.value;
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    StyleAttribute.canDefer = false;
    StyleAttribute = __decorate([
        Registry_1.Registry.attribute('vsn-styles')
    ], StyleAttribute);
    return StyleAttribute;
}(Attribute_1.Attribute));
exports.StyleAttribute = StyleAttribute;
//# sourceMappingURL=StyleAttribute.js.map