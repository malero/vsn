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
exports.XHRAttribute = void 0;
var Registry_1 = require("../Registry");
var Attribute_1 = require("../Attribute");
var AST_1 = require("../AST");
var VisionHelper_1 = require("../helpers/VisionHelper");
var XHR_1 = require("../contrib/XHR");
var XHRAttribute = /** @class */ (function (_super) {
    __extends(XHRAttribute, _super);
    function XHRAttribute() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(XHRAttribute.prototype, "code", {
        get: function () {
            return this.getAttributeValue();
        },
        enumerable: false,
        configurable: true
    });
    XHRAttribute.prototype.compile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.tree = new AST_1.Tree(this.code);
                        return [4 /*yield*/, this.tree.prepare(this.tag.scope, this.tag.dom, this.tag)];
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
    XHRAttribute.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isForm) {
                            this.tag.addEventHandler('submit', this.modifiers, this.handleEvent, this);
                        }
                        else if (this.isAnchor) {
                            this.tag.addEventHandler('click', this.modifiers, this.handleEvent, this);
                        }
                        return [4 /*yield*/, _super.prototype.connect.call(this)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(XHRAttribute.prototype, "isForm", {
        get: function () {
            return this.tag.element.tagName === 'FORM';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(XHRAttribute.prototype, "isAnchor", {
        get: function () {
            return this.tag.element.tagName === 'A';
        },
        enumerable: false,
        configurable: true
    });
    XHRAttribute.prototype.handleEvent = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var method, url, formData, data, formKeys, formKeys_1, formKeys_1_1, key, siteHeaders, key, siteFormData, key;
            var e_1, _a;
            return __generator(this, function (_b) {
                e.preventDefault();
                if (this.request)
                    return [2 /*return*/];
                this.request = new XMLHttpRequest();
                if (this.isForm) {
                    url = this.tag.element.getAttribute('action');
                    method = this.getAttributeBinding(this.tag.element.getAttribute('method'));
                    method = method.toUpperCase();
                    formData = new FormData(this.tag.element);
                    if (method == 'GET') {
                        data = {};
                        formKeys = Array.from(formData.keys());
                        try {
                            for (formKeys_1 = __values(formKeys), formKeys_1_1 = formKeys_1.next(); !formKeys_1_1.done; formKeys_1_1 = formKeys_1.next()) {
                                key = formKeys_1_1.value;
                                data[key] = formData.get(key);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (formKeys_1_1 && !formKeys_1_1.done && (_a = formKeys_1.return)) _a.call(formKeys_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        url = VisionHelper_1.VisionHelper.getUriWithParams(url, data);
                        formData = null;
                    }
                }
                else if (this.isAnchor) {
                    url = this.tag.element.getAttribute('href');
                    method = this.getAttributeBinding('GET');
                    method = method.toUpperCase();
                    if (['POST', 'PUT'].indexOf(method) > -1) {
                        formData = new FormData();
                    }
                }
                this.request.addEventListener('loadend', this.handleXHREvent.bind(this));
                this.request.addEventListener('error', this.handleXHREvent.bind(this));
                this.request.open(method, url);
                this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                siteHeaders = XHR_1.XHR.instance.getHeaders();
                for (key in siteHeaders) {
                    this.request.setRequestHeader(key, siteHeaders[key]);
                }
                if (formData instanceof FormData) {
                    siteFormData = XHR_1.XHR.instance.getFormData();
                    if (siteFormData) {
                        for (key in siteFormData) {
                            formData.append(key, siteFormData[key]);
                        }
                    }
                }
                this.request.send(formData);
                return [2 /*return*/];
            });
        });
    };
    XHRAttribute.prototype.handleXHREvent = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.tag.scope.set('status', this.request.status);
                        this.tag.scope.set('response', this.request.response);
                        if (!(this.request.status >= 200 && this.request.status < 300)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag)];
                    case 1:
                        _a.sent();
                        this.tag.element.dispatchEvent(new Event('xhr-success'));
                        return [3 /*break*/, 3];
                    case 2:
                        if (this.request.status >= 300 && this.request.status < 400) {
                            this.tag.element.dispatchEvent(new Event('xhr-redirect'));
                        }
                        else if (this.request.status >= 400 && this.request.status < 500) {
                            this.tag.element.dispatchEvent(new Event('xhr-client-error'));
                            this.tag.element.dispatchEvent(new Event('xhr-error'));
                        }
                        else {
                            this.tag.element.dispatchEvent(new Event('xhr-server-error'));
                            this.tag.element.dispatchEvent(new Event('xhr-error'));
                        }
                        _a.label = 3;
                    case 3:
                        this.request = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    XHRAttribute.canDefer = false;
    XHRAttribute = __decorate([
        Registry_1.Registry.attribute('vsn-xhr')
    ], XHRAttribute);
    return XHRAttribute;
}(Attribute_1.Attribute));
exports.XHRAttribute = XHRAttribute;
//# sourceMappingURL=XHRAttribute.js.map