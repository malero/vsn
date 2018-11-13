"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
var Scope = /** @class */ (function (_super) {
    __extends(Scope, _super);
    function Scope(parent) {
        var _this = _super.call(this) || this;
        if (parent)
            _this.parent = parent;
        _this.children = [];
        _this.data = new simple_ts_models_1.DataModel({});
        _this.keys = [];
        return _this;
    }
    Object.defineProperty(Scope.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (scope) {
            this._parent = scope;
            scope.addChild(this);
        },
        enumerable: true,
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
            if (val === undefined && i + 1 < len) {
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
        var value = this.data[key];
        if (value === undefined || value === null) {
            if (searchParents && this.parent)
                return this.parent.get(key, searchParents);
            return '';
        }
        return this.data[key];
    };
    Scope.prototype.set = function (key, value) {
        if (this.data[key] === undefined)
            this.data.createField(key);
        if (this.data[key] !== value) {
            this.data[key] = value;
            this.trigger("change:" + key, value);
            this.trigger('change', key, value);
        }
        if (this.keys.indexOf(key) === -1)
            this.keys.push(key);
    };
    Scope.prototype.clear = function () {
        for (var _i = 0, _a = this.keys; _i < _a.length; _i++) {
            var key = _a[_i];
            this.set(key, null);
        }
    };
    Scope.prototype.cleanup = function () {
        this.children.length = 0;
        this.parent = null;
    };
    Scope.prototype.wrap = function (wrapped) {
        var _this = this;
        if (this.wrapped !== undefined)
            throw Error("A scope can only wrap a single object");
        this.wrapped = wrapped;
        var _loop_1 = function (field) {
            var getter = function () {
                var val = _this.wrapped[field];
                if (typeof val === 'function')
                    val = val.bind(_this.data);
                return val;
            };
            var setter = function (value) {
                _this.wrapped[field] = value;
                _this.trigger("change:" + field, value);
                _this.trigger('change', field, value);
            };
            Object.defineProperty(this_1.data, field, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        };
        var this_1 = this;
        for (var field in wrapped) {
            _loop_1(field);
        }
    };
    return Scope;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Scope = Scope;
//# sourceMappingURL=Scope.js.map