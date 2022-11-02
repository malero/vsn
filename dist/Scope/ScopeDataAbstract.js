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
        if (!_this['__methods__'])
            _this.__methods__ = [];
        return _this;
    }
    ScopeDataAbstract.prototype.createMethod = function (name, method) {
    };
    ScopeDataAbstract.prototype.createProperty = function (name, propertyType, config) {
        var _this = this;
        if (propertyType === void 0) { propertyType = Property_1.Property; }
        if (this.hasProperty(name)) {
            return this.getProperty(name);
        }
        config = config || {};
        var instance = new propertyType(config.default, config);
        var propDesc = Object.getOwnPropertyDescriptor(this, name);
        this['__' + name] = instance;
        this.__properties__.push(name);
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
            _this.dispatch.apply(_this, __spreadArray(['change', name], __read(args)));
            _this.dispatch.apply(_this, __spreadArray(['change:' + name], __read(args)));
        });
        return instance;
    };
    ScopeDataAbstract.prototype.hasProperty = function (name) {
        return this.__properties__.indexOf(name) !== -1;
    };
    Object.defineProperty(ScopeDataAbstract.prototype, "keys", {
        get: function () {
            return __spreadArray([], __read(this.__properties__));
        },
        enumerable: false,
        configurable: true
    });
    ScopeDataAbstract.prototype.getKeys = function () {
        var e_1, _a;
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        var keys = [];
        try {
            for (var _b = __values(this.keys), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var property = this.getProperty(key);
                if (property.hasLabels(tags)) {
                    keys.push(key);
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
        return keys;
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
        var e_2, _a, e_3, _b;
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        var data = {};
        try {
            propLoop: for (var _c = __values(this.getProperties()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var key = _d.value;
                var property = this['__' + key];
                try {
                    for (var tags_1 = (e_3 = void 0, __values(tags)), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                        var tag = tags_1_1.value;
                        if (!property.hasLabel(tag))
                            continue propLoop;
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (tags_1_1 && !tags_1_1.done && (_b = tags_1.return)) _b.call(tags_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                if (this[key] == null || !property)
                    continue;
                data[key] = property.clean();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return data;
    };
    ScopeDataAbstract.prototype.get = function (key) {
        return this[key];
    };
    ScopeDataAbstract.prototype.set = function (key, value) {
        this[key] = value;
    };
    ScopeDataAbstract.prototype.getProperties = function () {
        return this.__properties__;
    };
    ScopeDataAbstract.prototype.getProperty = function (name, create) {
        if (create === void 0) { create = false; }
        var property = this['__' + name];
        if (create && !property) {
            property = this.createProperty(name);
        }
        return property;
    };
    ScopeDataAbstract.prototype.bindToProperties = function (event, properties, callback) {
        var e_4, _a;
        try {
            for (var properties_1 = __values(properties), properties_1_1 = properties_1.next(); !properties_1_1.done; properties_1_1 = properties_1.next()) {
                var name_1 = properties_1_1.value;
                var _property = this['__' + name_1];
                if (_property)
                    _property.on(event, callback);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (properties_1_1 && !properties_1_1.done && (_a = properties_1.return)) _a.call(properties_1);
            }
            finally { if (e_4) throw e_4.error; }
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
        var e_5, _a;
        var oData = this._lastData, nData = this.getData();
        try {
            for (var _b = __values(this.getProperties()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (nData[key] != oData[key])
                    return true;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return false;
    };
    return ScopeDataAbstract;
}(EventDispatcher_1.EventDispatcher));
exports.ScopeDataAbstract = ScopeDataAbstract;
//# sourceMappingURL=ScopeDataAbstract.js.map