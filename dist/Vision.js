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
Object.defineProperty(exports, "__esModule", { value: true });
exports.vision = exports.Vision = void 0;
var DOM_1 = require("./DOM");
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var Scope_1 = require("./Scope");
var simple_ts_promise_1 = require("simple-ts-promise");
var Vision = /** @class */ (function (_super) {
    __extends(Vision, _super);
    function Vision() {
        var _this = _super.call(this) || this;
        _this.controllers = {};
        document.addEventListener("DOMContentLoaded", _this.setup.bind(_this));
        _this.registerClass(Scope_1.WrappedArray, 'WrappedArray');
        return _this;
    }
    Object.defineProperty(Vision.prototype, "dom", {
        get: function () {
            return this._dom;
        },
        enumerable: false,
        configurable: true
    });
    Vision.prototype.setup = function () {
        var body = document.body;
        body.setAttribute('v-root', '');
        this._dom = new DOM_1.DOM(document);
    };
    Vision.prototype.registerClass = function (cls, constructorName) {
        if (constructorName === void 0) { constructorName = null; }
        var key = constructorName || cls.prototype.constructor.name;
        this.controllers[key] = cls;
        this.trigger("registered:" + key, cls);
    };
    Vision.prototype.getClass = function (key) {
        var deferred = simple_ts_promise_1.Promise.defer();
        if (!!this.controllers[key]) {
            deferred.resolve(this.controllers[key]);
        }
        else {
            this.once("registered:" + key, function (cls) {
                deferred.resolve(cls);
            });
        }
        return deferred.promise;
    };
    Object.defineProperty(Vision, "instance", {
        get: function () {
            if (!Vision._instance)
                Vision._instance = new Vision();
            return Vision._instance;
        },
        enumerable: false,
        configurable: true
    });
    return Vision;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Vision = Vision;
exports.vision = Vision.instance;
window['Vision'] = Vision;
window['vision'] = exports.vision;
//# sourceMappingURL=Vision.js.map