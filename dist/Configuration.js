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
exports.Configuration = void 0;
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var VisionHelper_1 = require("./helpers/VisionHelper");
var Configuration = /** @class */ (function (_super) {
    __extends(Configuration, _super);
    function Configuration() {
        var _this = _super.call(this) || this;
        _this.data = VisionHelper_1.VisionHelper.window && window['$configuration'] || {};
        return _this;
    }
    Configuration.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return this.data[key] === undefined ? defaultValue : this.data[key];
    };
    Configuration.prototype.set = function (key, value) {
        var prev = this.data[key];
        this.data[key] = value;
        this.trigger("change:" + key, {
            value: value,
            previous: prev
        });
        this.trigger('change', {
            key: key,
            value: value,
            previous: prev
        });
    };
    Configuration.set = function (key, value) {
        Configuration.instance.set(key, value);
    };
    Configuration.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return Configuration.instance.get(key, defaultValue);
    };
    Object.defineProperty(Configuration, "instance", {
        get: function () {
            if (!Configuration._instance)
                Configuration._instance = new Configuration();
            return Configuration._instance;
        },
        enumerable: false,
        configurable: true
    });
    return Configuration;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Configuration = Configuration;
//# sourceMappingURL=Configuration.js.map