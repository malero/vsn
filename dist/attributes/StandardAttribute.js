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
exports.StandardAttribute = void 0;
var Attribute_1 = require("../Attribute");
var StandardAttribute = /** @class */ (function (_super) {
    __extends(StandardAttribute, _super);
    function StandardAttribute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StandardAttribute.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.tag.isMagicAttribute(this.key) && !this.tag.element.hasAttribute(this.attributeName)) {
                            this.tag.element.setAttribute(this.attributeName, '');
                        }
                        return [4 /*yield*/, _super.prototype.setup.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StandardAttribute.prototype.extract = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.updateFrom();
                        return [4 /*yield*/, _super.prototype.extract.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StandardAttribute.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.tag.scope.on("change:" + this.key, this.updateTo, this);
                        return [4 /*yield*/, _super.prototype.connect.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StandardAttribute.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.tag.scope.offWithContext("change:" + this.key, this);
                        return [4 /*yield*/, _super.prototype.disconnect.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StandardAttribute.prototype.mutate = function (mutation) {
        _super.prototype.mutate.call(this, mutation);
        this.updateFrom();
    };
    Object.defineProperty(StandardAttribute.prototype, "needsToBeSynced", {
        get: function () {
            var currentScopeValue = this.tag.scope.get(this.key) || '';
            var value = this.value;
            if (currentScopeValue && currentScopeValue.trim)
                currentScopeValue = currentScopeValue.trim();
            if (value && value.trim)
                value = value.trim();
            if (currentScopeValue instanceof Array) {
                if (!(value instanceof Array) || currentScopeValue.length !== value.length)
                    return true;
                return currentScopeValue.map(function (v) { return value.indexOf(v) > -1; }).indexOf(false) > -1;
            }
            return currentScopeValue !== value;
        },
        enumerable: false,
        configurable: true
    });
    StandardAttribute.prototype.updateTo = function () {
        if (this.needsToBeSynced)
            this.value = this.tag.scope.get(this.key);
    };
    StandardAttribute.prototype.updateFrom = function () {
        if (this.needsToBeSynced)
            this.tag.scope.set(this.key, this.value);
    };
    Object.defineProperty(StandardAttribute.prototype, "key", {
        get: function () {
            return "@" + this.attributeName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardAttribute.prototype, "value", {
        get: function () {
            return this.tag.getElementAttribute(this.tag.isMagicAttribute(this.key) ? this.key : this.attributeName);
        },
        set: function (value) {
            this.tag.setElementAttribute(this.tag.isMagicAttribute(this.key) ? this.key : this.attributeName, value);
        },
        enumerable: false,
        configurable: true
    });
    StandardAttribute.canDefer = false;
    return StandardAttribute;
}(Attribute_1.Attribute));
exports.StandardAttribute = StandardAttribute;
//# sourceMappingURL=StandardAttribute.js.map