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
exports.WrappedArray = void 0;
var EventDispatcher_1 = require("../EventDispatcher");
var WrappedArray = /** @class */ (function (_super) {
    __extends(WrappedArray, _super);
    function WrappedArray() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var _this = _super.apply(this, __spreadArray([], __read(items))) || this;
        _this.$wrapped = true;
        Object.setPrototypeOf(_this, WrappedArray.prototype);
        _this.dispatcher = new EventDispatcher_1.EventDispatcher();
        return _this;
    }
    WrappedArray.prototype.dispatch = function (event) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (_a = this.dispatcher).dispatch.apply(_a, __spreadArray([event], __read(args)));
    };
    WrappedArray.prototype.on = function (event, callback, ctx) {
        this.dispatcher.on(event, callback, ctx);
    };
    WrappedArray.prototype.off = function (event, key) {
        this.dispatcher.off(event, key);
    };
    WrappedArray.prototype.once = function (event, callback) {
        this.dispatcher.once(event, callback);
    };
    WrappedArray.prototype.push = function () {
        var e_1, _a;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var num = _super.prototype.push.apply(this, __spreadArray([], __read(items)));
        this.dispatch.apply(this, __spreadArray(['push'], __read(items)));
        this.dispatch('change', {
            'added': items
        });
        try {
            for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var item = items_1_1.value;
                this.dispatch('add', item);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return num;
    };
    WrappedArray.prototype.remove = function (item) {
        var index = this.indexOf(item);
        if (index === -1) {
            return false;
        }
        this.splice(index, 1);
        return true;
    };
    WrappedArray.prototype.pop = function () {
        var item = _super.prototype.pop.call(this);
        this.dispatch('pop', item);
        this.dispatch('change', {
            'removed': [item]
        });
        this.dispatch('remove', item);
        return item;
    };
    WrappedArray.prototype.shift = function () {
        var item = _super.prototype.shift.call(this);
        this.dispatch('shift', item);
        this.dispatch('change', {
            'removed': [item]
        });
        this.dispatch('remove', item);
        return item;
    };
    WrappedArray.prototype.splice = function (start, deleteCount) {
        var e_2, _a;
        var removed = _super.prototype.splice.call(this, start, deleteCount);
        this.dispatch('change', {
            'removed': removed
        });
        try {
            for (var removed_1 = __values(removed), removed_1_1 = removed_1.next(); !removed_1_1.done; removed_1_1 = removed_1.next()) {
                var item = removed_1_1.value;
                this.dispatch('remove', item);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (removed_1_1 && !removed_1_1.done && (_a = removed_1.return)) _a.call(removed_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return removed;
    };
    WrappedArray.prototype.concat = function () {
        var e_3, _a;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var concat = _super.prototype.concat.apply(this, __spreadArray([], __read(items)));
        this.dispatch('change', {
            'added': concat
        });
        try {
            for (var concat_1 = __values(concat), concat_1_1 = concat_1.next(); !concat_1_1.done; concat_1_1 = concat_1.next()) {
                var item = concat_1_1.value;
                this.dispatch('add', item);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (concat_1_1 && !concat_1_1.done && (_a = concat_1.return)) _a.call(concat_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return concat;
    };
    WrappedArray.prototype.filter = function (callback, thisArg) {
        var filtered = _super.prototype.filter.call(this, callback, thisArg);
        return new (WrappedArray.bind.apply(WrappedArray, __spreadArray([void 0], __read(filtered))))();
    };
    WrappedArray.prototype.get = function (key) {
        var keys = [
            'length'
        ];
        return keys.indexOf(key) > -1 ? this[key] : undefined;
    };
    Object.defineProperty(WrappedArray.prototype, "length", {
        get: function () {
            var e_4, _a;
            var c = 0;
            try {
                for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var item = _c.value;
                    c += 1;
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return c;
        },
        set: function (num) {
            this.setLength(num);
        },
        enumerable: false,
        configurable: true
    });
    WrappedArray.prototype.setLength = function (num) {
        var e_5, _a, e_6, _b;
        var c = 0;
        var toRemove = [];
        try {
            for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                var item = _d.value;
                c += 1;
                if (c >= num) {
                    toRemove.push(item);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_5) throw e_5.error; }
        }
        try {
            for (var toRemove_1 = __values(toRemove), toRemove_1_1 = toRemove_1.next(); !toRemove_1_1.done; toRemove_1_1 = toRemove_1.next()) {
                var item = toRemove_1_1.value;
                this.splice(this.indexOf(item), 1);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (toRemove_1_1 && !toRemove_1_1.done && (_b = toRemove_1.return)) _b.call(toRemove_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    return WrappedArray;
}(Array));
exports.WrappedArray = WrappedArray;
//# sourceMappingURL=WrappedArray.js.map