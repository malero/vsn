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
exports.Scope = exports.WrappedArray = exports.ScopeReference = void 0;
var simple_ts_models_1 = require("simple-ts-models");
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var ScopeReference = /** @class */ (function () {
    function ScopeReference(scope, key, value) {
        this.scope = scope;
        this.key = key;
        this.value = value;
    }
    return ScopeReference;
}());
exports.ScopeReference = ScopeReference;
var WrappedArray = /** @class */ (function (_super) {
    __extends(WrappedArray, _super);
    function WrappedArray() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var _this = _super.apply(this, items) || this;
        _this.$wrapped = true;
        Object.setPrototypeOf(_this, WrappedArray.prototype);
        _this._lastKey = 0;
        _this._listeners = {};
        return _this;
    }
    WrappedArray.prototype.push = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var num = _super.prototype.push.apply(this, items);
        this.trigger.apply(this, __spreadArray(['push'], items));
        for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
            var item = items_1[_a];
            this.trigger('add', item);
        }
        return num;
    };
    WrappedArray.prototype.bind = function (event, fct, context, once) {
        once = once || false;
        this._lastKey++;
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(new simple_ts_event_dispatcher_1.EventCallback(fct, this._lastKey, once, context));
        return this._lastKey;
    };
    WrappedArray.prototype.once = function (event, fct, context) {
        return this.bind(event, fct, context, true);
    };
    WrappedArray.prototype.unbind = function (event, key) {
        if (event in this._listeners === false)
            return false;
        if (key) {
            for (var _i = 0, _a = this._listeners[event]; _i < _a.length; _i++) {
                var cb = _a[_i];
                if (key == cb.key) {
                    this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
                    return true;
                }
            }
        }
        else {
            this._listeners[event] = [];
            return true;
        }
        return false;
    };
    WrappedArray.prototype.unbindWithContext = function (event, context) {
        if (event in this._listeners === false)
            return 0;
        var toRemove = [], cnt = 0;
        for (var _i = 0, _a = this._listeners[event]; _i < _a.length; _i++) {
            var cb = _a[_i];
            if (context == cb.context) {
                toRemove.push(cb);
            }
        }
        for (var _b = 0, toRemove_1 = toRemove; _b < toRemove_1.length; _b++) {
            var cb = toRemove_1[_b];
            this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
            cnt++;
        }
        return cnt;
    };
    WrappedArray.prototype.getListener = function (event, key) {
        for (var _i = 0, _a = this._listeners[event]; _i < _a.length; _i++) {
            var cb = _a[_i];
            if (key == cb.key)
                return cb;
        }
    };
    WrappedArray.prototype.trigger = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (event in this._listeners === false)
            return;
        for (var i = 0; i < this._listeners[event].length; i++) {
            var cb = this._listeners[event][i];
            // We need to unbind callbacks before they're called to prevent
            // infinite loops if the event is somehow triggered within the
            // callback
            if (cb.once) {
                this.unbind(event, cb.key);
                i--;
            }
            cb.call(args);
        }
    };
    return WrappedArray;
}(Array));
exports.WrappedArray = WrappedArray;
var Scope = /** @class */ (function (_super) {
    __extends(Scope, _super);
    function Scope(parent) {
        var _this = _super.call(this) || this;
        if (parent)
            _this.parentScope = parent;
        _this.children = [];
        _this.data = new simple_ts_models_1.DataModel({});
        _this.keys = [];
        return _this;
    }
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
    Scope.prototype.getReference = function (path) {
        var scopePath = path.split('.');
        var key = scopePath[0];
        var scope = this;
        var val = null;
        var len = scopePath.length;
        for (var i = 0; i < len; i++) {
            key = scopePath[i];
            val = scope.get(key, i === 0);
            if ([null, undefined].indexOf(val) > -1 && i + 1 < len) {
                val = new Scope(scope);
                scope.set(key, val);
            }
            if (val && val instanceof Scope) {
                scope = val;
            }
        }
        return new ScopeReference(scope, key, val);
    };
    Scope.prototype.get = function (key, searchParents) {
        if (searchParents === void 0) { searchParents = true; }
        if (key.indexOf('-') > -1)
            throw Error('Cannot have hyphens in variable names.');
        var value = this.data[key];
        if (value === undefined) {
            if (searchParents && this.parentScope)
                return this.parentScope.get(key, searchParents);
            return '';
        }
        return this.data[key];
    };
    Scope.prototype.set = function (key, value) {
        if (key.indexOf('-') > -1)
            throw Error('Cannot have hyphens in variable names.');
        if (this.data[key] === undefined)
            this.data.createField(key);
        if (this.data[key] !== value) {
            var previousValue = this.data[key];
            this.data[key] = value;
            var event_1 = {
                value: value,
                previousValue: previousValue,
                key: key
            };
            this.trigger("change:" + key, event_1);
            this.trigger('change', key, event_1);
        }
        if (this.keys.indexOf(key) === -1)
            this.keys.push(key);
    };
    Scope.prototype.extend = function (data) {
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var key = data_1[_i];
            this.set(key, data[key]);
        }
    };
    Scope.prototype.clear = function () {
        for (var _i = 0, _a = this.keys; _i < _a.length; _i++) {
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
    Scope.prototype.wrap = function (wrapped, triggerUpdates) {
        var _this = this;
        if (triggerUpdates === void 0) { triggerUpdates = false; }
        if ([null, undefined].indexOf(this.wrapped) === -1)
            throw Error("A scope can only wrap a single object");
        if (!wrapped) {
            throw Error("Can only wrap objects.");
        }
        if (wrapped['$wrapped']) {
            throw Error("An object should only be wrapped once.");
        }
        this.wrapped = wrapped;
        this.wrapped['$wrapped'] = true;
        var _loop_1 = function (field) {
            if (['constructor'].indexOf(field) > -1 || field.startsWith('$'))
                return "continue";
            if (this_1.wrapped[field] instanceof Array) {
                this_1.wrapped[field] = new (WrappedArray.bind.apply(WrappedArray, __spreadArray([void 0], wrapped[field])))();
            }
            // Populate scope data from wrapped object before we update the getter
            if (this_1.wrapped[field] !== undefined)
                this_1.set(field, this_1.wrapped[field]);
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
                this_1.trigger("change:" + field);
        };
        var this_1 = this;
        for (var field in wrapped) {
            _loop_1(field);
        }
        this.wrapped.get = this.get.bind(this);
        this.wrapped.set = this.set.bind(this);
        this.wrapped.bind = this.bind.bind(this);
        this.wrapped.once = this.once.bind(this);
        this.wrapped.unbind = this.unbind.bind(this);
    };
    Scope.prototype.unwrap = function () {
        for (var field in this.wrapped) {
            Object.defineProperty(this.wrapped, field, {
                get: function () { return null; },
                set: function (_) { return null; },
                enumerable: true,
                configurable: true
            });
        }
        this.wrapped = null;
    };
    return Scope;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Scope = Scope;
//# sourceMappingURL=Scope.js.map