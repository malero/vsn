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
exports.FunctionScope = exports.Scope = void 0;
var EventDispatcher_1 = require("./EventDispatcher");
var ScopeReference_1 = require("./Scope/ScopeReference");
var QueryReference_1 = require("./Scope/QueryReference");
var WrappedArray_1 = require("./Scope/WrappedArray");
var ScopeData_1 = require("./Scope/ScopeData");
var DynamicScopeData_1 = require("./Scope/DynamicScopeData");
var Scope = /** @class */ (function (_super) {
    __extends(Scope, _super);
    function Scope(parent) {
        var _this = _super.call(this) || this;
        if (parent)
            _this.parentScope = parent;
        _this.children = [];
        _this._data = new DynamicScopeData_1.DynamicScopeData({});
        _this._data.addRelay(_this);
        return _this;
    }
    Object.defineProperty(Scope.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scope.prototype, "parentScope", {
        get: function () {
            return this._parentScope;
        },
        set: function (scope) {
            this._parentScope = scope;
            scope.addChild(this);
        },
        enumerable: false,
        configurable: true
    });
    Scope.prototype.addChild = function (scope) {
        this.children.push(scope);
    };
    Scope.prototype.getReference = function (path, createIfNotFound) {
        if (createIfNotFound === void 0) { createIfNotFound = true; }
        var scopePath = path.split('.');
        var key = scopePath[0];
        var scope = this;
        var val = null;
        var len = scopePath.length;
        if (path.startsWith('?')) {
            return new QueryReference_1.QueryReference(path, scope);
        }
        for (var i = 0; i < len; i++) {
            key = scopePath[i];
            val = scope.get(key, i === 0);
            var isNull = [null, undefined].indexOf(val) > -1;
            if (createIfNotFound && isNull && i + 1 < len) {
                val = new Scope(scope);
                scope.set(key, val);
            }
            else if (!createIfNotFound && isNull) {
                return null;
            }
            if (val && val instanceof Scope) {
                scope = val;
            }
        }
        return new ScopeReference_1.ScopeReference(scope, key, val);
    };
    Scope.prototype.get = function (key, searchParents) {
        if (searchParents === void 0) { searchParents = true; }
        var value = this._data[key];
        if (value === undefined) {
            if (searchParents && this.parentScope)
                return this.parentScope.get(key, searchParents);
            return '';
        }
        return value;
    };
    Scope.prototype.set = function (key, value) {
        if (!this._data.hasProperty(key))
            this._data.createProperty(key);
        this._data[key] = value;
    };
    Object.defineProperty(Scope.prototype, "keys", {
        get: function () {
            return this._data.keys;
        },
        enumerable: false,
        configurable: true
    });
    Scope.prototype.has = function (key) {
        return this._data.hasProperty(key);
    };
    Scope.prototype.setType = function (key, type) {
        var property = this._data.getProperty(key, true);
        property.type = type;
        if (this.has(key))
            this.set(key, this.get(key));
    };
    Scope.prototype.getType = function (key) {
        var property = this._data.getProperty(key);
        return property === null || property === void 0 ? void 0 : property.type;
    };
    Scope.prototype.extend = function (data) {
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var key = data_1[_i];
            this.set(key, data[key]);
        }
    };
    Scope.prototype.clear = function () {
        for (var _i = 0, _a = this._data.keys; _i < _a.length; _i++) {
            var key = _a[_i];
            if (['function', 'object'].indexOf(typeof this.get(key)) > -1)
                continue;
            this.set(key, null);
        }
    };
    Scope.prototype.cleanup = function () {
        this.children.length = 0;
        this.parentScope = null;
    };
    Scope.prototype.wrap = function (toWrap, triggerUpdates, updateFromWrapped) {
        var _this = this;
        if (triggerUpdates === void 0) { triggerUpdates = false; }
        if (updateFromWrapped === void 0) { updateFromWrapped = true; }
        if (toWrap instanceof ScopeData_1.ScopeData) {
            if (this._data instanceof EventDispatcher_1.EventDispatcher) {
                this._data.removeRelay(this);
                this._data.deconstruct();
            }
            this.wrapped = toWrap;
            this._data = toWrap;
            this._data.addRelay(this);
            return;
        }
        if (toWrap instanceof Scope)
            toWrap = toWrap._data;
        if ([null, undefined].indexOf(this.wrapped) === -1)
            throw Error("A scope can only wrap a single object");
        if (!toWrap) {
            throw Error("Can only wrap objects.");
        }
        if (toWrap['$wrapped']) {
            throw Error("An object should only be wrapped once.");
        }
        this.wrapped = toWrap;
        this.wrapped['$wrapped'] = true;
        var _loop_1 = function (field) {
            if (['constructor'].indexOf(field) > -1 || field.startsWith('$'))
                return "continue";
            if (this_1.wrapped[field] instanceof Function) {
                this_1.set(field, this_1.wrapped[field]);
                return "continue";
            }
            if (this_1.wrapped[field] instanceof Array) {
                if (!(this_1.wrapped[field] instanceof WrappedArray_1.WrappedArray)) {
                    this_1.wrapped[field] = new (WrappedArray_1.WrappedArray.bind.apply(WrappedArray_1.WrappedArray, __spreadArray([void 0], toWrap[field])))();
                }
                this_1.wrapped[field].on('change', function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this.dispatch.apply(_this, __spreadArray(["change:" + field], args));
                });
            }
            if (typeof this_1.wrapped[field] == 'object' && this_1.wrapped[field] && this_1.wrapped[field].constructor === Object) {
                var innerObject = new Scope(this_1);
                innerObject.wrap(this_1.wrapped[field]);
                this_1.wrapped[field] = innerObject;
            }
            // Populate scope data from wrapped object before we update the getter
            if (updateFromWrapped && [null, undefined].indexOf(this_1.wrapped[field]) === -1) {
                this_1.set(field, this_1.wrapped[field]);
            }
            var getter = function () {
                return _this.get(field);
            };
            var setter = function (value) {
                _this.set(field, value);
            };
            Object.defineProperty(this_1.wrapped, field, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
            if (triggerUpdates)
                this_1.dispatch("change:" + field);
        };
        var this_1 = this;
        for (var field in toWrap) {
            _loop_1(field);
        }
        this.wrapped.get = this.get.bind(this);
        this.wrapped.set = this.set.bind(this);
        this.wrapped.on = this.on.bind(this);
        this.wrapped.once = this.once.bind(this);
        this.wrapped.off = this.off.bind(this);
    };
    Scope.prototype.unwrap = function () {
        if (!this.wrapped)
            return;
        var toUnwrap = this.wrapped;
        this.wrapped = null;
        toUnwrap.$wrapped = false;
        for (var field in toUnwrap) {
            delete toUnwrap[field];
        }
    };
    Scope.fromObject = function (obj, parentScope) {
        var scope = new Scope(parentScope);
        scope.wrap(obj);
        return scope;
    };
    return Scope;
}(EventDispatcher_1.EventDispatcher));
exports.Scope = Scope;
var FunctionScope = /** @class */ (function (_super) {
    __extends(FunctionScope, _super);
    function FunctionScope() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FunctionScope.prototype.set = function (key, value) {
        if (this.parentScope.has(key) || ['$', '@'].indexOf(key[0]) > -1)
            this.parentScope.set(key, value);
        else
            _super.prototype.set.call(this, key, value);
    };
    return FunctionScope;
}(Scope));
exports.FunctionScope = FunctionScope;
//# sourceMappingURL=Scope.js.map