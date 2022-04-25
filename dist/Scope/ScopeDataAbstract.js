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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeDataAbstract = void 0;
var Property_1 = require("./properties/Property");
var EventDispatcher_1 = require("../EventDispatcher");
var ScopeDataAbstract = /** @class */ (function (_super) {
    __extends(ScopeDataAbstract, _super);
    function ScopeDataAbstract() {
        var _this = _super.call(this) || this;
        // Objects may have __properties__ from prototype
        if (!_this['__properties__'])
            _this.__properties__ = [];
        return _this;
    }
    ScopeDataAbstract.prototype.createProperty = function (name, propertyType, config) {
        var _this = this;
        if (propertyType === void 0) { propertyType = Property_1.Property; }
        config = config || {};
        var instance = new propertyType(config.default, config), propDesc = Object.getOwnPropertyDescriptor(this, name);
        this['__' + name] = instance;
        // property getter
        var propertyGetter = function () {
            return instance.value;
        };
        var getter = propDesc ? propDesc.get : propertyGetter, propertySetter = function (newVal) {
            instance.value = newVal;
        }, setter = propDesc ? propDesc.set : propertySetter;
        // Delete the original property
        delete this[name];
        // Create new property with getter and setter
        Object.defineProperty(this, name, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
        instance.on('change', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this.dispatch.apply(_this, __spreadArray(['change', name], args));
            _this.dispatch.apply(_this, __spreadArray(['change:' + name], args));
        });
        return instance;
    };
    ScopeDataAbstract.prototype.hasProperty = function (name) {
        return this.__properties__.indexOf(name) !== -1;
    };
    ScopeDataAbstract.prototype.setData = function (data) {
        var properties = this.getProperties();
        for (var key in data) {
            if (properties.indexOf(key) > -1) {
                this[key] = data[key];
            }
        }
    };
    ScopeDataAbstract.prototype.getData = function () {
        var data = {};
        for (var _i = 0, _a = this.getProperties(); _i < _a.length; _i++) {
            var key = _a[_i];
            var property = this['__' + key];
            if (this[key] == null || !property)
                continue;
            data[key] = property.getData();
        }
        return data;
    };
    ScopeDataAbstract.prototype.getProperties = function () {
        return this.__properties__;
    };
    ScopeDataAbstract.prototype.getProperty = function (name) {
        return this['__' + name];
    };
    ScopeDataAbstract.prototype.bindToProperties = function (event, properties, callback) {
        for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
            var name_1 = properties_1[_i];
            var _property = this['__' + name_1];
            if (_property)
                _property.on(event, callback);
        }
    };
    ScopeDataAbstract.prototype.setLastData = function () {
        this._lastData = this.getData();
    };
    /*
     * Revert data to the last setData() call. Useful for forms that edit a
     * list of items and then hit cancel rather than saving the list.
     */
    ScopeDataAbstract.prototype.revert = function () {
        this.setData(this._lastData);
    };
    ScopeDataAbstract.prototype.isModified = function () {
        var oData = this._lastData, nData = this.getData();
        for (var _i = 0, _a = this.getProperties(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (nData[key] != oData[key])
                return true;
        }
        return false;
    };
    return ScopeDataAbstract;
}(EventDispatcher_1.EventDispatcher));
exports.ScopeDataAbstract = ScopeDataAbstract;
//# sourceMappingURL=ScopeDataAbstract.js.map