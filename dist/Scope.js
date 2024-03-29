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
exports.FunctionScope = exports.Scope = void 0;
var EventDispatcher_1 = require("./EventDispatcher");
var ScopeReference_1 = require("./Scope/ScopeReference");
var QueryReference_1 = require("./Scope/QueryReference");
var WrappedArray_1 = require("./Scope/WrappedArray");
var ScopeData_1 = require("./Scope/ScopeData");
var DynamicScopeData_1 = require("./Scope/DynamicScopeData");
var DOM_1 = require("./DOM");
var ScopeAbstract_1 = require("./Scope/ScopeAbstract");
var Scope = /** @class */ (function (_super) {
    __extends(Scope, _super);
    function Scope(parent) {
        var _this = _super.call(this) || this;
        _this._isGarbage = false;
        if (parent)
            _this.parentScope = parent;
        _this.children = [];
        _this._data = new DynamicScopeData_1.DynamicScopeData({});
        _this._data.addRelay(_this);
        return _this;
    }
    Scope.prototype.deconstruct = function () {
        var e_1, _a;
        _super.prototype.deconstruct.call(this);
        this.collectGarbage(true);
        this.wrapped = null;
        if (this._data)
            this._data.deconstruct();
        this._data = null;
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.deconstruct();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.children.length = 0;
        this.parentScope = null;
    };
    Object.defineProperty(Scope.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scope.prototype, "objectify", {
        get: function () {
            var e_2, _a;
            var obj = {};
            try {
                for (var _b = __values(this.keys), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    var value = this.get(key);
                    if (value instanceof Scope)
                        obj[key] = value.objectify;
                    else
                        obj[key] = value;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return obj;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scope.prototype, "parentScope", {
        get: function () {
            if (this._parentScope)
                return this._parentScope;
            var rootScope = DOM_1.DOM.instance.root.scope;
            return this == rootScope ? null : rootScope;
        },
        set: function (scope) {
            if (this._parentScope && this._parentScope !== scope)
                this._parentScope.removeChild(this);
            if (scope) {
                this._parentScope = scope;
                scope.addChild(this);
            }
            else if (this._parentScope) {
                this._parentScope.removeChild(this);
                this._parentScope = null;
            }
        },
        enumerable: false,
        configurable: true
    });
    Scope.prototype.addChild = function (scope) {
        this.children.push(scope);
    };
    Scope.prototype.removeChild = function (scope) {
        var index = this.children.indexOf(scope);
        if (index > -1)
            this.children.splice(index, 1);
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
        if (this._data === null)
            return null;
        var value = this._data[key];
        if (value === undefined) {
            if (searchParents && this.parentScope)
                return this.parentScope.get(key, searchParents);
            return '';
        }
        return value;
    };
    Scope.prototype.set = function (key, value, detectType) {
        if (detectType === void 0) { detectType = false; }
        if (this._data === null)
            return;
        if (detectType) {
            var type = typeof value;
            if (type === 'number') {
                if (value % 1 === 0)
                    this.setType(key, 'integer');
                else
                    this.setType(key, 'float');
            }
            else if (type === 'string') {
                this.setType(key, 'string');
            }
            else if (type === 'boolean') {
                this.setType(key, 'boolean');
            }
        }
        if (!this._data.hasProperty(key))
            this._data.createProperty(key);
        this._data[key] = value;
    };
    Scope.prototype.remove = function (key) {
        if (this._data === null)
            return;
        this._data.removeProperty(key);
    };
    Object.defineProperty(Scope.prototype, "keys", {
        get: function () {
            if (this._data === null)
                return [];
            return this._data.keys;
        },
        enumerable: false,
        configurable: true
    });
    Scope.prototype.has = function (key) {
        if (this._data === null)
            return false;
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
        var e_3, _a;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var key = data_1_1.value;
                this.set(key, data[key]);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    Scope.prototype.clear = function () {
        var e_4, _a;
        try {
            for (var _b = __values(this._data.keys), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (['function', 'object'].indexOf(typeof this.get(key)) > -1)
                    continue;
                this.set(key, null);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    Scope.prototype.cleanup = function () {
        this.children.length = 0;
        this.parentScope = null;
    };
    Object.defineProperty(Scope.prototype, "isGarbage", {
        get: function () {
            return this._isGarbage;
        },
        enumerable: false,
        configurable: true
    });
    Scope.prototype.collectGarbage = function (force) {
        var e_5, _a;
        if (force === void 0) { force = false; }
        this._isGarbage = true;
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child.collectGarbage(force);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (force)
            this.cleanup();
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
                    this_1.wrapped[field] = new (WrappedArray_1.WrappedArray.bind.apply(WrappedArray_1.WrappedArray, __spreadArray([void 0], __read(toWrap[field]))))();
                }
                this_1.wrapped[field].on('change', function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    _this.dispatch.apply(_this, __spreadArray(["change:" + field], __read(args)));
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
        this.wrapped.has = this.has.bind(this);
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
}(ScopeAbstract_1.ScopeAbstract));
exports.Scope = Scope;
var FunctionScope = /** @class */ (function (_super) {
    __extends(FunctionScope, _super);
    function FunctionScope(parentScope) {
        var _this = _super.call(this, parentScope) || this;
        _this.addRelay(parentScope);
        return _this;
    }
    FunctionScope.prototype.set = function (key, value) {
        if (this.parentScope && (this.parentScope.has(key) || ['$', '@'].indexOf(key[0]) > -1)) {
            this.parentScope.set(key, value);
        }
        else {
            _super.prototype.set.call(this, key, value);
        }
    };
    FunctionScope.prototype.collectGarbage = function (force) {
        if (force === void 0) { force = true; }
        _super.prototype.collectGarbage.call(this, true);
    };
    return FunctionScope;
}(Scope));
exports.FunctionScope = FunctionScope;
//# sourceMappingURL=Scope.js.map