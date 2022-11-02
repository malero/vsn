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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePromise = exports.noop = exports.EPromiseStates = void 0;
var EventDispatcher_1 = require("./EventDispatcher");
var EPromiseStates;
(function (EPromiseStates) {
    EPromiseStates[EPromiseStates["PENDING"] = 0] = "PENDING";
    EPromiseStates[EPromiseStates["FULFILLED"] = 1] = "FULFILLED";
    EPromiseStates[EPromiseStates["REJECTED"] = 2] = "REJECTED";
})(EPromiseStates = exports.EPromiseStates || (exports.EPromiseStates = {}));
function noop(result) { return result; }
exports.noop = noop;
var SimplePromise = /** @class */ (function (_super) {
    __extends(SimplePromise, _super);
    function SimplePromise(executor) {
        var _this = _super.call(this) || this;
        _this._result = null;
        _this._state = EPromiseStates.PENDING;
        _this.promiseClass = (Object.getPrototypeOf(_this).constructor);
        try {
            executor(_this._resolve.bind(_this), _this._reject.bind(_this));
        }
        catch (e) {
            _this._reject(e);
        }
        return _this;
    }
    Object.defineProperty(SimplePromise.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SimplePromise.prototype, "result", {
        get: function () {
            return this._result;
        },
        enumerable: false,
        configurable: true
    });
    SimplePromise.defer = function () {
        var promise = new SimplePromise(function (res, rej) { });
        return {
            promise: promise,
            resolve: promise._resolve.bind(promise),
            reject: promise._reject.bind(promise)
        };
    };
    /*
     * Returns a Promise object that is resolved with the given value. If the value is a thenable (i.e. has a then
     * method), the returned promise will "follow" that thenable, adopting its eventual state; otherwise the returned
     * promise will be fulfilled with the value. Generally, if you don't know if a value is a promise or not,
     * Promise.resolve(value) it instead and work with the return value as a promise.
     */
    SimplePromise.resolve = function (result) {
        return new SimplePromise(function (resolve) {
            if (result instanceof SimplePromise) {
                result.then(function (innerResult) {
                    resolve(innerResult);
                });
            }
            else {
                resolve(result);
            }
        });
    };
    /*
     * Returns a Promise object that is rejected with the given reason.
     */
    SimplePromise.reject = function (reason) {
        return new SimplePromise(function (resolve, reject) {
            reject(reason);
        });
    };
    /*
     * Returns a promise that either fulfills when all of the promises in the iterable argument have fulfilled or
     * rejects as soon as one of the promises in the iterable argument rejects. If the returned promise fulfills, it is
     * fulfilled with an array of the values from the fulfilled promises in the same order as defined in the iterable.
     * If the returned promise rejects, it is rejected with the reason from the first promise in the iterable that
     * rejected. This method can be useful for aggregating results of multiple promises.
     */
    SimplePromise.all = function (iter) {
        var e_1, _a;
        var deferred = SimplePromise.defer();
        var done = true;
        try {
            for (var iter_1 = __values(iter), iter_1_1 = iter_1.next(); !iter_1_1.done; iter_1_1 = iter_1.next()) {
                var promise = iter_1_1.value;
                if (promise.state == EPromiseStates.PENDING) {
                    done = false;
                    promise.once('fulfilled', function (result) {
                        SimplePromise.poolResults(iter, deferred);
                    });
                    promise.once('rejected', function (reason) {
                        deferred.reject(reason);
                    });
                }
                else if (promise.state == EPromiseStates.REJECTED) {
                    deferred.reject(promise.result);
                    done = false;
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iter_1_1 && !iter_1_1.done && (_a = iter_1.return)) _a.call(iter_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (done)
            SimplePromise.poolResults(iter, deferred);
        return deferred.promise;
    };
    SimplePromise.poolResults = function (iter, deferred) {
        var e_2, _a;
        var done = true;
        var results = [];
        try {
            for (var iter_2 = __values(iter), iter_2_1 = iter_2.next(); !iter_2_1.done; iter_2_1 = iter_2.next()) {
                var p = iter_2_1.value;
                if (p.state === EPromiseStates.REJECTED) {
                    deferred.reject(p.result);
                    break;
                }
                else if (p.state === EPromiseStates.PENDING) {
                    done = false;
                }
                results.push(p.result);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (iter_2_1 && !iter_2_1.done && (_a = iter_2.return)) _a.call(iter_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (done)
            deferred.resolve(results);
    };
    /*
     * Returns a promise that fulfills or rejects as soon as one of the promises in the iterable fulfills or rejects,
     * with the value or reason from that promise.
     */
    SimplePromise.race = function (iter) {
        var e_3, _a;
        var deferred = SimplePromise.defer();
        try {
            for (var iter_3 = __values(iter), iter_3_1 = iter_3.next(); !iter_3_1.done; iter_3_1 = iter_3.next()) {
                var promise = iter_3_1.value;
                promise.once('fulfilled', function (result) {
                    deferred.resolve(result);
                });
                promise.once('rejected', function (reason) {
                    deferred.reject(reason);
                });
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (iter_3_1 && !iter_3_1.done && (_a = iter_3.return)) _a.call(iter_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return deferred.promise;
    };
    /*
     * Appends fulfillment and rejection handlers to the promise, and returns a new promise resolving to the return
     * value of the called handler, or to its original settled value if the promise was not handled (i.e. if the
     * relevant handler onFulfilled or onRejected is not a function).
     */
    SimplePromise.prototype.then = function (success, error) {
        var _this = this;
        return new this.promiseClass(function (resolve, reject) {
            if (_this.state === EPromiseStates.FULFILLED) {
                if (success)
                    resolve(success(_this.result));
            }
            else if (_this.state === EPromiseStates.REJECTED) {
                if (error)
                    reject(error(_this.result));
            }
            else {
                _this.once('fulfilled', function (result) {
                    if (success)
                        resolve(success(result));
                });
                _this.once('rejected', function (reason) {
                    if (error)
                        reject(error(reason));
                });
            }
        });
    };
    /*
     * Appends a rejection handler callback to the promise, and returns a new promise resolving to the return value of
     * the callback if it is called, or to its original fulfillment value if the promise is instead fulfilled.
     */
    SimplePromise.prototype.catch = function (onRejected) {
        return this.then(undefined, onRejected);
    };
    /*
     * Appends a handler to the promise, and returns a new promise which is resolved when the original promise is
     * resolved. The handler is called when the promise is settled, whether fulfilled or rejected.
     */
    SimplePromise.prototype.finally = function (finallyCallback) {
        var success = function (result) { return finallyCallback(result); };
        var error = function (reason) { return finallyCallback(reason); };
        return this.then(success, error);
    };
    SimplePromise.prototype._resolve = function (result) {
        if (this.state !== EPromiseStates.PENDING)
            return;
        this._state = EPromiseStates.FULFILLED;
        this._result = result;
        this.dispatch('fulfilled', result);
    };
    SimplePromise.prototype._reject = function (reason) {
        if (this.state !== EPromiseStates.PENDING)
            return;
        this._state = EPromiseStates.REJECTED;
        this._result = reason;
        this.dispatch('rejected', reason);
    };
    return SimplePromise;
}(EventDispatcher_1.EventDispatcher));
exports.SimplePromise = SimplePromise;
//# sourceMappingURL=SimplePromise.js.map