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
exports.Property = exports.method = exports.property = void 0;
var EventDispatcher_1 = require("../../EventDispatcher");
var Registry_1 = require("../../Registry");
function property(propertyType, config) {
    if (propertyType === void 0) { propertyType = Property; }
    if (config === void 0) { config = {}; }
    return function (target, key) {
        if (target.__properties__ == undefined) {
            target.__properties__ = [];
        }
        // Abstract/extended classes share __properties__
        if (target.__properties__.indexOf(key) == -1)
            target.__properties__.push(key);
        var getter = function () {
            return [propertyType, config];
        };
        Object.defineProperty(target, '__' + key + '__', {
            get: getter,
            set: function (v) { },
            enumerable: false,
            configurable: true
        });
    };
}
exports.property = property;
function method(config) {
    if (config === void 0) { config = {}; }
    return function (target, key) {
        if (target.__methods__ == undefined) {
            target.__methods__ = [];
        }
        // Abstract/extended classes share __properties__
        if (target.__methods__.indexOf(key) == -1)
            target.__methods__.push(key);
        var getter = function () {
            return config;
        };
        Object.defineProperty(target, '__' + key + '__', {
            get: getter,
            set: function (v) { },
            enumerable: false,
            configurable: true
        });
    };
}
exports.method = method;
var Property = /** @class */ (function (_super) {
    __extends(Property, _super);
    function Property(value, config) {
        var _this = _super.call(this) || this;
        _this._type = 'any';
        _this.config = config;
        if (!_this.config.labels)
            _this.config.labels = [];
        if (!_this.config.validators)
            _this.config.validators = [];
        _this.type = config.type || 'any';
        _this.value = value;
        return _this;
    }
    Property.prototype.deconstruct = function () {
        _super.prototype.deconstruct.call(this);
        delete this._type;
        delete this._value;
        this.config = {};
    };
    Property.prototype.castType = function (value) {
        var caster = Registry_1.Registry.instance.types.getSynchronous(this.type);
        return caster ? caster(value) : value;
    };
    Object.defineProperty(Property.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (v) {
            var oldValue = this._value;
            this._value = this.castType(v);
            if (this._value !== oldValue) {
                this.dispatch('change', {
                    oldValue: oldValue,
                    value: v
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Property.prototype.clean = function () {
        return this.value;
    };
    Object.defineProperty(Property.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (type) {
            if (this._type != type) {
                this._type = type;
                this.value = this.value; // Need to reset value to have it cast to the new type
            }
        },
        enumerable: false,
        configurable: true
    });
    Property.prototype.validate = function () {
        var e_1, _a;
        var errors = [];
        try {
            for (var _b = __values(this.config.validators || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                var validator = _c.value;
                errors.concat(validator(this.value));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return errors;
    };
    Property.prototype.getValidator = function (id) {
        var validator = Registry_1.Registry.instance.validators.getSynchronous(id);
        if (!validator)
            throw new Error("Invalid validator " + id);
        return validator;
    };
    Property.prototype.addValidator = function (validator) {
        if (typeof validator == 'string') {
            validator = this.getValidator(validator);
        }
        if (this.config.validators.indexOf(validator) == -1)
            this.config.validators.push(validator);
    };
    Property.prototype.addLabel = function (label) {
        if (this.config.labels == undefined) {
            this.config.labels = [];
        }
        if (this.config.labels.indexOf(label) == -1) {
            this.config.labels.push(label);
        }
    };
    Property.prototype.removeLabel = function (label) {
        if (this.config.labels == undefined) {
            return;
        }
        var index = this.config.labels.indexOf(label);
        if (index != -1) {
            this.config.labels.splice(index, 1);
        }
    };
    Property.prototype.hasLabel = function (label) {
        return this.config.labels.indexOf(label) !== -1;
    };
    Property.prototype.hasLabels = function (labels) {
        var e_2, _a;
        try {
            for (var labels_1 = __values(labels), labels_1_1 = labels_1.next(); !labels_1_1.done; labels_1_1 = labels_1.next()) {
                var label = labels_1_1.value;
                if (!this.hasLabel(label)) {
                    return false;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (labels_1_1 && !labels_1_1.done && (_a = labels_1.return)) _a.call(labels_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return true;
    };
    return Property;
}(EventDispatcher_1.EventDispatcher));
exports.Property = Property;
//# sourceMappingURL=Property.js.map