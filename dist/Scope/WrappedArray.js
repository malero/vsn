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
exports.WrappedArray = void 0;
var EventDispatcher_1 = require("../EventDispatcher");
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
        _this.dispatcher = new EventDispatcher_1.EventDispatcher();
        return _this;
    }
    WrappedArray.prototype.dispatch = function (event) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (_a = this.dispatcher).dispatch.apply(_a, __spreadArray([event], args));
    };
    WrappedArray.prototype.on = function (event, callback) {
        this.dispatcher.on(event, callback);
    };
    WrappedArray.prototype.off = function (event, key) {
        this.dispatcher.off(event, key);
    };
    WrappedArray.prototype.once = function (event, callback) {
        this.dispatcher.once(event, callback);
    };
    WrappedArray.prototype.push = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var num = _super.prototype.push.apply(this, items);
        this.dispatch.apply(this, __spreadArray(['push'], items));
        this.dispatch('change', {
            'added': items
        });
        for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
            var item = items_1[_a];
            this.dispatch('add', item);
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
    WrappedArray.prototype.splice = function (start, deleteCount) {
        var removed = _super.prototype.splice.call(this, start, deleteCount);
        this.dispatch('change', {
            'removed': removed
        });
        for (var _i = 0, removed_1 = removed; _i < removed_1.length; _i++) {
            var item = removed_1[_i];
            this.dispatch('remove', item);
        }
        return removed;
    };
    WrappedArray.prototype.concat = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var concat = _super.prototype.concat.apply(this, items);
        this.dispatch('change', {
            'added': concat
        });
        for (var _a = 0, concat_1 = concat; _a < concat_1.length; _a++) {
            var item = concat_1[_a];
            this.dispatch('add', item);
        }
        return concat;
    };
    WrappedArray.prototype.filter = function (callback, thisArg) {
        var filtered = _super.prototype.filter.call(this, callback, thisArg);
        return new (WrappedArray.bind.apply(WrappedArray, __spreadArray([void 0], filtered)))();
    };
    WrappedArray.prototype.get = function (key) {
        var keys = [
            'length'
        ];
        return keys.indexOf(key) > -1 ? this[key] : undefined;
    };
    Object.defineProperty(WrappedArray.prototype, "length", {
        get: function () {
            var c = 0;
            for (var _i = 0, _a = this; _i < _a.length; _i++) {
                var item = _a[_i];
                c += 1;
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
        var c = 0;
        var toRemove = [];
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var item = _a[_i];
            c += 1;
            if (c >= num) {
                toRemove.push(item);
            }
        }
        for (var _b = 0, toRemove_1 = toRemove; _b < toRemove_1.length; _b++) {
            var item = toRemove_1[_b];
            this.splice(this.indexOf(item), 1);
        }
    };
    return WrappedArray;
}(Array));
exports.WrappedArray = WrappedArray;
//# sourceMappingURL=WrappedArray.js.map