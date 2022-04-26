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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayProperty = void 0;
var Property_1 = require("./Property");
var WrappedArray_1 = require("../WrappedArray");
var ArrayProperty = /** @class */ (function (_super) {
    __extends(ArrayProperty, _super);
    function ArrayProperty(value, config) {
        var _this = _super.call(this, new WrappedArray_1.WrappedArray(), config) || this;
        _this._value.dispatcher.addRelay(_this);
        _this.value = value;
        return _this;
    }
    Object.defineProperty(ArrayProperty.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (v) {
            if (!(v instanceof Array))
                v = [v];
            this._value.splice(0, this._value.length);
            for (var i = 0; i < v.length; i++)
                this._value.push(v[i]);
        },
        enumerable: false,
        configurable: true
    });
    return ArrayProperty;
}(Property_1.Property));
exports.ArrayProperty = ArrayProperty;
//# sourceMappingURL=ArrayProperty.js.map