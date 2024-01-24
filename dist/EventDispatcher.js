"use strict";
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
        (_a = this.fnc).apply.apply(_a, __spreadArray([this.context], __read(args)));
        this.calls += 1;
        return true;
    };
    EventCallback.prototype.deconstruct = function () {
        var self = this;
        self.fnc = null;
        self.context = null;
    };
    return EventCallback;
}());
exports.EventCallback = EventCallback;
var EventDispatcher = /** @class */ (function () {
    function EventDispatcher() {
        this._allListeners = [];
        this._relays = [];
        this._lastKey = 0;
        this._listeners = {};
        EventDispatcher.sources.push(this);
    }
    EventDispatcher.prototype.deconstruct = function () {
        var e_1, _a, e_2, _b, e_3, _c;
        this.dispatch('deconstruct', this);
        var sourceIndex = EventDispatcher.sources.indexOf(this);
        if (sourceIndex > -1) {
            EventDispatcher.sources.splice(sourceIndex, 1);
        }
        for (var k in this._listeners) {
            try {
                for (var _d = (e_1 = void 0, __values(this._listeners[k])), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var cb = _e.value;
                    cb.deconstruct();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            delete this._listeners[k];
        }
        try {
            for (var _f = __values(this._allListeners), _g = _f.next(); !_g.done; _g = _f.next()) {
                var cb = _g.value;
                cb.deconstruct();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            for (var _h = __values(this._allListeners), _j = _h.next(); !_j.done; _j = _h.next()) {
                var cb = _j.value;
                cb.deconstruct();
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
            }
            finally { if (e_3) throw e_3.error; }
        }
        this._listeners = {};
        this._relays.length = 0;
        this._allListeners.length = 0;
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
    EventDispatcher.prototype.promise = function (event) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            _this.once(event, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                resolve(args);
            }, null);
        });
    };
    EventDispatcher.prototype.off = function (event, key) {
        var e_4, _a;
        if (!(event in this._listeners))
            return false;
        if (key) {
            try {
                for (var _b = __values(this._listeners[event]), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var cb = _c.value;
                    if (key == cb.key) {
                        this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
                        return true;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        else {
            this._listeners[event] = [];
            return true;
        }
        return false;
    };
    EventDispatcher.prototype.offWithContext = function (event, context) {
        var e_5, _a, e_6, _b;
        if (!(event in this._listeners))
            return 0;
        var toRemove = [], cnt = 0;
        try {
            for (var _c = __values(this._listeners[event]), _d = _c.next(); !_d.done; _d = _c.next()) {
                var cb = _d.value;
                if (context == cb.context) {
                    toRemove.push(cb);
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
                var cb = toRemove_1_1.value;
                this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
                cnt++;
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (toRemove_1_1 && !toRemove_1_1.done && (_b = toRemove_1.return)) _b.call(toRemove_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return cnt;
    };
    EventDispatcher.prototype.getListener = function (event, key) {
        var e_7, _a;
        try {
            for (var _b = __values(this._listeners[event]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var cb = _c.value;
                if (key == cb.key)
                    return cb;
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
    };
    EventDispatcher.prototype.all = function (fct, context, once) {
        once = once || false;
        this._lastKey++;
        this._allListeners.push(new EventCallback(fct, this._lastKey, once, context));
        return this._lastKey;
    };
    EventDispatcher.prototype.none = function (key) {
        var e_8, _a;
        try {
            for (var _b = __values(this._allListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var cb = _c.value;
                if (key == cb.key) {
                    this._allListeners.splice(this._allListeners.indexOf(cb), 1);
                    return true;
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return false;
    };
    EventDispatcher.prototype.noneWithContext = function (context) {
        var e_9, _a, e_10, _b, e_11, _c, e_12, _d;
        var toRemoveAll = [];
        var cnt = 0;
        try {
            for (var _e = __values(this._allListeners), _f = _e.next(); !_f.done; _f = _e.next()) {
                var cb = _f.value;
                if (context == cb.context) {
                    toRemoveAll.push(cb);
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_9) throw e_9.error; }
        }
        for (var k in this._listeners) {
            var toRemove = [];
            try {
                for (var _g = (e_10 = void 0, __values(this._listeners[k])), _h = _g.next(); !_h.done; _h = _g.next()) {
                    var cb = _h.value;
                    if (context == cb.context) {
                        toRemove.push(cb);
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                }
                finally { if (e_10) throw e_10.error; }
            }
            try {
                for (var toRemove_2 = (e_11 = void 0, __values(toRemove)), toRemove_2_1 = toRemove_2.next(); !toRemove_2_1.done; toRemove_2_1 = toRemove_2.next()) {
                    var cb = toRemove_2_1.value;
                    this._listeners[k].splice(this._listeners[k].indexOf(cb), 1);
                    cnt++;
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (toRemove_2_1 && !toRemove_2_1.done && (_c = toRemove_2.return)) _c.call(toRemove_2);
                }
                finally { if (e_11) throw e_11.error; }
            }
        }
        try {
            for (var toRemoveAll_1 = __values(toRemoveAll), toRemoveAll_1_1 = toRemoveAll_1.next(); !toRemoveAll_1_1.done; toRemoveAll_1_1 = toRemoveAll_1.next()) {
                var cb = toRemoveAll_1_1.value;
                this._allListeners.splice(this._allListeners.indexOf(cb), 1);
                cnt++;
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (toRemoveAll_1_1 && !toRemoveAll_1_1.done && (_d = toRemoveAll_1.return)) _d.call(toRemoveAll_1);
            }
            finally { if (e_12) throw e_12.error; }
        }
        return cnt;
    };
    EventDispatcher.prototype.dispatch = function (event) {
        var e_13, _a, e_14, _b, _c;
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
        try {
            for (var _d = __values(this._allListeners), _e = _d.next(); !_e.done; _e = _d.next()) {
                var cb = _e.value;
                if (cb.once) {
                    this.none(cb.key);
                }
                cb.call(args);
            }
        }
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_13) throw e_13.error; }
        }
        try {
            for (var _f = __values(this._relays), _g = _f.next(); !_g.done; _g = _f.next()) {
                var relay = _g.value;
                relay.dispatch.apply(relay, __spreadArray([event], __read(args)));
            }
        }
        catch (e_14_1) { e_14 = { error: e_14_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_14) throw e_14.error; }
        }
        if (this === EventDispatcher.stream)
            return;
        var streamArgs = args;
        if (args.length > 0 && args[0] !== this)
            streamArgs = __spreadArray([this], __read(args));
        (_c = EventDispatcher.stream).dispatch.apply(_c, __spreadArray([event], __read(streamArgs)));
    };
    EventDispatcher.sources = [];
    EventDispatcher.stream = new EventDispatcher();
    return EventDispatcher;
}());
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=EventDispatcher.js.map