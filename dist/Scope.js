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
        _this.parent = parent;
        _this.data = new simple_ts_models_1.DataModel({});
        return _this;
    }
    Scope.prototype.getReference = function (path) {
        var scopePath = path.split('.');
        var key = scopePath[0];
        var scope = this;
        var val = null;
        var len = scopePath.length;
        for (var i = 0; i < len; i++) {
            key = scopePath[i];
            val = scope.get(key);
            if (val === undefined && i + 1 < len) {
                val = new Scope(scope);
                scope.set(key, val);
            }
            if (val && typeof val.get === 'function') {
                scope = val;
            }
        }
        return new ScopeReference(scope, key, val);
    };
    Scope.prototype.get = function (key) {
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
    };
    return Scope;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Scope = Scope;
var Wrapper = /** @class */ (function (_super) {
    __extends(Wrapper, _super);
    function Wrapper(wrapped, // Instantiated object from v-controller attribute,
    parent) {
        var _this = _super.call(this, parent) || this;
        _this.wrapped = wrapped;
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
        return _this;
    }
    return Wrapper;
}(Scope));
exports.Wrapper = Wrapper;
//# sourceMappingURL=Scope.js.map