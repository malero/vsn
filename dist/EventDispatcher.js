"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = exports.EventCallback = void 0;
var EventCallback = /** @class */ (function () {
    function EventCallback(fnc, key, once, context) {
        this.fnc = fnc;
        this.key = key;
        this.once = once;
        this.context = context;
        this.calls = 0;
    }
    EventCallback.prototype.call = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.once && this.calls > 0)
            return false;
        (_a = this.fnc).apply.apply(_a, __spreadArray([this.context], args));
        this.calls += 1;
        return true;
    };
    return EventCallback;
}());
exports.EventCallback = EventCallback;
var EventDispatcher = /** @class */ (function () {
    function EventDispatcher() {
        this._relays = [];
        this._lastKey = 0;
        this._listeners = {};
        EventDispatcher.sources.push(this);
    }
    EventDispatcher.prototype.deconstruct = function () {
        this.dispatch('deconstruct', this);
        EventDispatcher.sources.splice(EventDispatcher.sources.indexOf(this), 1);
        for (var k in this._listeners) {
            delete this._listeners[k];
        }
    };
    EventDispatcher.prototype.addRelay = function (relay) {
        this._relays.push(relay);
    };
    EventDispatcher.prototype.removeRelay = function (relay) {
        if (this._relays.indexOf(relay) > -1)
            this._relays.splice(this._relays.indexOf(relay), 1);
    };
    EventDispatcher.prototype.on = function (event, fct, context, once) {
        once = once || false;
        this._lastKey++;
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(new EventCallback(fct, this._lastKey, once, context));
        return this._lastKey;
    };
    EventDispatcher.prototype.once = function (event, fct, context) {
        return this.on(event, fct, context, true);
    };
    EventDispatcher.prototype.off = function (event, key) {
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
    EventDispatcher.prototype.offWithContext = function (event, context) {
        if (!(event in this._listeners))
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
    EventDispatcher.prototype.getListener = function (event, key) {
        for (var _i = 0, _a = this._listeners[event]; _i < _a.length; _i++) {
            var cb = _a[_i];
            if (key == cb.key)
                return cb;
        }
    };
    EventDispatcher.prototype.dispatch = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (event in this._listeners) {
            for (var i = 0; i < this._listeners[event].length; i++) {
                var cb = this._listeners[event][i];
                // We need to unbind callbacks before they're called to prevent
                // infinite loops if the event is somehow triggered within the
                // callback
                if (cb.once) {
                    this.off(event, cb.key);
                    i--;
                }
                cb.call(args);
            }
        }
        for (var _a = 0, _b = this._relays; _a < _b.length; _a++) {
            var relay = _b[_a];
            relay.dispatch.apply(relay, __spreadArray([event], args));
        }
    };
    EventDispatcher.sources = [];
    return EventDispatcher;
}());
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=EventDispatcher.js.map