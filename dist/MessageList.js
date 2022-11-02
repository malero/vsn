"use strict";
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
exports.MessageList = void 0;
var MessageList = /** @class */ (function () {
    function MessageList(messages) {
        this.reset();
        if (messages)
            this.merge(messages);
    }
    MessageList.prototype.reset = function () {
        var e_1, _a;
        // Reset the object
        var keys = this.keys;
        this._cachedList = undefined;
        if (keys.length > 0) {
            try {
                for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                    var field = keys_1_1.value;
                    delete this[field];
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    MessageList.prototype.add = function (field, errors, replace) {
        var _a;
        if (replace === void 0) { replace = false; }
        this.merge((_a = {},
            _a[field] = typeof errors == 'string' ? [errors] : errors,
            _a), replace);
    };
    MessageList.prototype.merge = function (messages, replace) {
        var _this = this;
        if (replace === void 0) { replace = false; }
        if (!messages)
            return;
        this._cachedList = undefined;
        var keys = this.keys;
        var _loop_1 = function (field) {
            if (!messages.hasOwnProperty(field))
                return "continue";
            var message = messages[field];
            if (message instanceof Array) {
                if (!replace && keys.indexOf(field) > -1) {
                    message.map(function (x) {
                        _this[field].push(x);
                    });
                }
                else if (message.length > 0) {
                    this_1[field] = message;
                }
            }
        };
        var this_1 = this;
        for (var field in messages) {
            _loop_1(field);
        }
    };
    Object.defineProperty(MessageList.prototype, "list", {
        get: function () {
            var e_2, _a;
            if (this._cachedList)
                return this._cachedList;
            var list = {}, keys = this.keys;
            try {
                for (var keys_2 = __values(keys), keys_2_1 = keys_2.next(); !keys_2_1.done; keys_2_1 = keys_2.next()) {
                    var field = keys_2_1.value;
                    list[field] = this[field];
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (keys_2_1 && !keys_2_1.done && (_a = keys_2.return)) _a.call(keys_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this._cachedList = list;
            return list;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MessageList.prototype, "keys", {
        get: function () {
            var keys = Object.keys(this);
            keys.splice(keys.indexOf('_cachedList'), 1);
            return keys;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MessageList.prototype, "length", {
        get: function () {
            return this.keys.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MessageList.prototype, "isEmpty", {
        get: function () {
            return this.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    return MessageList;
}());
exports.MessageList = MessageList;
//# sourceMappingURL=MessageList.js.map