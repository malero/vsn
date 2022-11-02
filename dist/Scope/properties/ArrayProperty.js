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
exports.ArrayProperty = void 0;
var Property_1 = require("./Property");
var WrappedArray_1 = require("../WrappedArray");
var ArrayProperty = /** @class */ (function (_super) {
    __extends(ArrayProperty, _super);
    function ArrayProperty(value, config) {
        var _this = _super.call(this, new WrappedArray_1.WrappedArray(), config) || this;
        _this.allKey = _this._value.dispatcher.all(_this.relayEvent.bind(_this), _this);
        if (value !== undefined) {
            _this.value = value;
        }
        return _this;
    }
    ArrayProperty.prototype.deconstruct = function () {
        this._value.dispatcher.none(this.allKey);
        _super.prototype.deconstruct.call(this);
    };
    ArrayProperty.prototype.relayEvent = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.dispatch.apply(this, __spreadArray(['change'], __read(args)));
    };
    Object.defineProperty(ArrayProperty.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (v) {
            if (!(v instanceof Array))
                v = [v];
            if (this._value instanceof WrappedArray_1.WrappedArray) {
                this._value.splice(0, this._value.length);
                for (var i = 0; i < v.length; i++)
                    this._value.push(v[i]);
            }
            else if (v instanceof WrappedArray_1.WrappedArray) {
                this._value = v;
            }
        },
        enumerable: false,
        configurable: true
    });
    ArrayProperty.prototype.clean = function () {
        return Array.from(this._value);
    };
    return ArrayProperty;
}(Property_1.Property));
exports.ArrayProperty = ArrayProperty;
//# sourceMappingURL=ArrayProperty.js.map