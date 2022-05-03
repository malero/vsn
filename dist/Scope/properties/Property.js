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
exports.Property = exports.property = void 0;
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
var Property = /** @class */ (function (_super) {
    __extends(Property, _super);
    function Property(value, config) {
        var _this = _super.call(this) || this;
        _this._type = 'any';
        _this.config = config;
        if (!_this.config.tags)
            _this.config.tags = [];
        if (!_this.config.validators)
            _this.config.validators = [];
        _this.type = config.type || 'any';
        _this.value = value;
        return _this;
    }
    Property.prototype.castType = function (value) {
        var caster = Registry_1.Registry.instance.types.getSynchronous(this.type);
        return caster(value);
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
        var errors = [];
        for (var _i = 0, _a = this.config.validators || []; _i < _a.length; _i++) {
            var validator = _a[_i];
            errors.concat(validator(this.value));
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
    Property.prototype.removeValidator = function (validator) {
        if (typeof validator == 'string') {
            validator = this.getValidator(validator);
        }
        var index = this.config.validators.indexOf(validator);
        if (index != -1)
            this.config.validators.splice(index, 1);
    };
    Property.prototype.addTag = function (tag) {
        if (this.config.tags == undefined) {
            this.config.tags = [];
        }
        if (this.config.tags.indexOf(tag) == -1) {
            this.config.tags.push(tag);
        }
    };
    Property.prototype.removeTag = function (tag) {
        if (this.config.tags == undefined) {
            return;
        }
        var index = this.config.tags.indexOf(tag);
        if (index != -1) {
            this.config.tags.splice(index, 1);
        }
    };
    Property.prototype.hasTag = function (tag) {
        return this.config.tags.indexOf(tag) !== -1;
    };
    Property.prototype.hasTags = function (tags) {
        for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
            var tag = tags_1[_i];
            if (!this.hasTag(tag)) {
                return false;
            }
        }
        return true;
    };
    return Property;
}(EventDispatcher_1.EventDispatcher));
exports.Property = Property;
//# sourceMappingURL=Property.js.map