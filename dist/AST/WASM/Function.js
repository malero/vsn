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
exports.FunctionSection = void 0;
var WASM_1 = require("../WASM");
var Section_1 = require("./Section");
var FunctionSection = /** @class */ (function (_super) {
    __extends(FunctionSection, _super);
    function FunctionSection(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.variables = {};
        _this.params = [];
        _this.results = [];
        _this.code = [];
        return _this;
    }
    FunctionSection.prototype.addParam = function (paramType, name) {
        if (name === void 0) { name = null; }
        var index = this.params.length;
        name = name || "$param" + index;
        this.variables[name] = index;
        this.params.push(paramType);
    };
    FunctionSection.prototype.addResult = function (paramType) {
        this.results.push(paramType);
    };
    FunctionSection.prototype.addCode = function (code) {
        var _a;
        (_a = this.code).push.apply(_a, __spreadArray([], __read(code)));
    };
    Object.defineProperty(FunctionSection.prototype, "sectionTypes", {
        get: function () {
            return __spreadArray(__spreadArray(__spreadArray([
                WASM_1.functionType,
                this.paramCount
            ], __read(this.paramTypes)), [
                this.resultCount
            ]), __read(this.resultTypes));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FunctionSection.prototype, "sectionExport", {
        get: function () {
            return __spreadArray(__spreadArray([], __read(WASM_1.encodeString(this.name))), [
                WASM_1.EExportType.func,
            ]);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FunctionSection.prototype, "sectionCode", {
        get: function () {
            return WASM_1.encodeVector(this.code);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FunctionSection.prototype, "paramCount", {
        get: function () {
            return this.params.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FunctionSection.prototype, "paramTypes", {
        get: function () {
            return this.params;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FunctionSection.prototype, "resultCount", {
        get: function () {
            return this.results.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FunctionSection.prototype, "resultTypes", {
        get: function () {
            return this.results;
        },
        enumerable: false,
        configurable: true
    });
    return FunctionSection;
}(Section_1.Section));
exports.FunctionSection = FunctionSection;
//# sourceMappingURL=Function.js.map