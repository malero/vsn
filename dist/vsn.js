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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
exports.vision = exports.Tag = exports.property = exports.Property = exports.Controller = exports.WrappedArray = exports.ScopeReference = exports.Scope = exports.DOM = exports.Vision = void 0;
var DOM_1 = require("./DOM");
var WrappedArray_1 = require("./Scope/WrappedArray");
var Registry_1 = require("./Registry");
require("./Types");
require("./Formats");
var Configuration_1 = require("./Configuration");
var VisionHelper_1 = require("./helpers/VisionHelper");
var AST_1 = require("./AST");
var Query_1 = require("./Query");
var EventDispatcher_1 = require("./EventDispatcher");
var DynamicScopeData_1 = require("./Scope/DynamicScopeData");
var Vision = /** @class */ (function (_super) {
    __extends(Vision, _super);
    function Vision() {
        var _this = _super.call(this) || this;
        _this.registry = Registry_1.Registry.instance;
        _this.config = Configuration_1.Configuration.instance;
        if (VisionHelper_1.VisionHelper.document) {
            document.addEventListener("DOMContentLoaded", _this.setup.bind(_this));
        }
        else {
            console.warn('No dom, running in CLI mode.');
        }
        _this.registry.classes.register('Object', Object);
        _this.registry.classes.register('WrappedArray', WrappedArray_1.WrappedArray);
        _this.registry.classes.register('Data', DynamicScopeData_1.DynamicScopeData);
        if (VisionHelper_1.VisionHelper.window) {
            window['Vision'] = Vision;
            window['Registry'] = Registry_1.Registry;
            window['vision'] = window['vsn'] = _this;
            window['Tree'] = AST_1.Tree;
            window['$'] = Query_1.Query;
            VisionHelper_1.VisionHelper.window.dispatchEvent(new Event('vsn'));
        }
        return _this;
    }
    Object.defineProperty(Vision.prototype, "dom", {
        get: function () {
            return this._dom;
        },
        enumerable: false,
        configurable: true
    });
    Vision.prototype.eval = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._dom.eval(code)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Vision.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body, startTime, now, setupTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = document.body;
                        body.setAttribute('vsn-root', '');
                        this._dom = DOM_1.DOM.instance;
                        startTime = new Date().getTime();
                        return [4 /*yield*/, this._dom.buildFrom(document, true)];
                    case 1:
                        _a.sent();
                        now = (new Date()).getTime();
                        setupTime = now - startTime;
                        console.warn("Took " + setupTime + "ms to start up VisionJS. https://www.vsnjs.com/");
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Vision, "instance", {
        get: function () {
            if (!Vision._instance)
                Vision._instance = new Vision();
            return Vision._instance;
        },
        enumerable: false,
        configurable: true
    });
    return Vision;
}(EventDispatcher_1.EventDispatcher));
exports.Vision = Vision;
__exportStar(require("./attributes/_imports"), exports);
__exportStar(require("./Registry"), exports);
__exportStar(require("./Attribute"), exports);
__exportStar(require("./AST"), exports);
var DOM_2 = require("./DOM");
Object.defineProperty(exports, "DOM", { enumerable: true, get: function () { return DOM_2.DOM; } });
var Scope_1 = require("./Scope");
Object.defineProperty(exports, "Scope", { enumerable: true, get: function () { return Scope_1.Scope; } });
var ScopeReference_1 = require("./Scope/ScopeReference");
Object.defineProperty(exports, "ScopeReference", { enumerable: true, get: function () { return ScopeReference_1.ScopeReference; } });
var WrappedArray_2 = require("./Scope/WrappedArray");
Object.defineProperty(exports, "WrappedArray", { enumerable: true, get: function () { return WrappedArray_2.WrappedArray; } });
var Controller_1 = require("./Controller");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return Controller_1.Controller; } });
var Property_1 = require("./Scope/properties/Property");
Object.defineProperty(exports, "Property", { enumerable: true, get: function () { return Property_1.Property; } });
Object.defineProperty(exports, "property", { enumerable: true, get: function () { return Property_1.property; } });
var Tag_1 = require("./Tag");
Object.defineProperty(exports, "Tag", { enumerable: true, get: function () { return Tag_1.Tag; } });
exports.vision = Vision.instance;
//# sourceMappingURL=vsn.js.map