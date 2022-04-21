"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageList = /** @class */ (function () {
    function MessageList(messages) {
        this.reset();
        if (messages)
            this.merge(messages);
    }
    MessageList.prototype.reset = function () {
        // Reset the object
        var keys = this.keys;
        this._cachedList = undefined;
        if (keys.length > 0) {
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var field = keys_1[_i];
                delete this[field];
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
            if (this._cachedList)
                return this._cachedList;
            var list = {}, keys = this.keys;
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var field = keys_2[_i];
                list[field] = this[field];
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
    return MessageList;
}());
exports.default = MessageList;
//# sourceMappingURL=MessageList.js.map