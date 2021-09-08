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
exports.Bind = void 0;
var Attribute_1 = require("../Attribute");
var AST_1 = require("../AST");
var Registry_1 = require("../Registry");
var Bind = /** @class */ (function (_super) {
    __extends(Bind, _super);
    function Bind() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.direction = 'both';
        _this.formatter = function (v) { return v; };
        return _this;
    }
    Bind.prototype.compile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tree = new AST_1.Tree(this.getAttributeValue());
                        return [4 /*yield*/, tree.prepare(this.tag.scope, this.tag.dom, this.tag)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.compile.call(this)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bind.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mods;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.property = this.getAttributeBinding();
                        mods = this.getAttributeModifiers();
                        if (mods.length) {
                            if (mods.indexOf('from') > -1) {
                                this.direction = 'from';
                            }
                            else if (mods.indexOf('to') > -1) {
                                this.direction = 'to';
                            }
                        }
                        return [4 /*yield*/, _super.prototype.setup.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bind.prototype.extract = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scopeKey, ref, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        scopeKey = this.getAttributeValue();
                        try {
                            ref = this.tag.scope.getReference(scopeKey);
                        }
                        catch (e) {
                            console.error('error', e);
                            return [2 /*return*/];
                        }
                        _a = this;
                        return [4 /*yield*/, ref.getKey()];
                    case 1:
                        _a.key = _c.sent();
                        _b = this;
                        return [4 /*yield*/, ref.getScope()];
                    case 2:
                        _b.boundScope = _c.sent();
                        if (!!this.valueFromElement)
                            this.updateFrom();
                        return [4 /*yield*/, _super.prototype.extract.call(this)];
                    case 3:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bind.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.doUpdateTo) {
                            this.updateTo();
                            this.boundScope.bind("change:" + this.key, this.updateTo, this);
                        }
                        return [4 /*yield*/, _super.prototype.connect.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bind.prototype.evaluate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var elementValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elementValue = this.valueFromElement;
                        if (!!elementValue)
                            this.updateFrom();
                        this.updateTo();
                        return [4 /*yield*/, _super.prototype.evaluate.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Bind.prototype, "value", {
        get: function () {
            if (!this.boundScope)
                return null;
            return this.boundScope.get(this.key, false);
        },
        set: function (v) {
            if (this.boundScope) {
                this.boundScope.set(this.key, v);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Bind.prototype, "valueFromElement", {
        get: function () {
            var value;
            if (this.property) {
                value = this.tag.element.getAttribute(this.property);
            }
            else {
                value = this.tag.value;
            }
            return value;
        },
        enumerable: false,
        configurable: true
    });
    Bind.prototype.mutate = function (mutation) {
        _super.prototype.mutate.call(this, mutation);
        if (!this.doUpdateFrom)
            return;
        // Element innerText binding
        if (!this.property && [
            'characterData',
            'childList'
        ].indexOf(mutation.type) > -1)
            this.updateFrom();
        // Input value binding
        else if (!this.property && mutation.type == 'attributes' && mutation.attributeName === 'value')
            this.updateFrom();
        // Attribute binding
        else if (mutation.type === 'attributes' && mutation.attributeName == this.property)
            this.updateFrom();
    };
    Object.defineProperty(Bind.prototype, "doUpdateFrom", {
        get: function () {
            return ['both', 'to'].indexOf(this.direction) > -1;
        },
        enumerable: false,
        configurable: true
    });
    Bind.prototype.updateFrom = function () {
        if (!this.doUpdateFrom)
            return;
        var valueFromElement = this.valueFromElement;
        valueFromElement = typeof valueFromElement === 'string' && valueFromElement.trim() || valueFromElement;
        var valueFromScope = this.value;
        valueFromScope = typeof valueFromScope === 'string' && valueFromScope.trim() || valueFromScope;
        valueFromScope = this.formatter(valueFromScope); // Apply format for comparison
        if (!valueFromScope || valueFromElement != valueFromScope)
            this.value = valueFromElement;
    };
    Object.defineProperty(Bind.prototype, "doUpdateTo", {
        get: function () {
            return ['both', 'from'].indexOf(this.direction) > -1;
        },
        enumerable: false,
        configurable: true
    });
    Bind.prototype.updateTo = function () {
        if (!this.doUpdateTo)
            return;
        var value = this.formatter(this.value);
        if (this.property) {
            this.tag.element.setAttribute(this.property, value);
        }
        else {
            this.tag.value = value;
        }
    };
    Bind.prototype.setFormatter = function (formatter) {
        this.formatter = formatter;
    };
    Bind.canDefer = false;
    Bind = __decorate([
        Registry_1.Registry.attribute('vsn-bind')
    ], Bind);
    return Bind;
}(Attribute_1.Attribute));
exports.Bind = Bind;
//# sourceMappingURL=Bind.js.map