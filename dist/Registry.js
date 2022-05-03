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
exports.Registry = exports.RegistryStore = exports.register = void 0;
var EventDispatcher_1 = require("./EventDispatcher");
var SimplePromise_1 = require("./SimplePromise");
function register(store, key, setup) {
    if (key === void 0) { key = null; }
    if (setup === void 0) { setup = null; }
    return function (target, _key) {
        if (_key === void 0) { _key = null; }
        key = key || target.prototype.constructor.name;
        if (_key !== null)
            target = target[_key];
        Registry.instance[store].register(key, target);
        if (setup)
            setup();
    };
}
exports.register = register;
var RegistryStore = /** @class */ (function (_super) {
    __extends(RegistryStore, _super);
    function RegistryStore(defaults) {
        if (defaults === void 0) { defaults = null; }
        var _this = _super.call(this) || this;
        _this.timeouts = {};
        _this.store = defaults || {};
        return _this;
    }
    RegistryStore.prototype.register = function (key, item) {
        this.store[key] = item;
        this.dispatch("registered:" + key, item);
    };
    RegistryStore.prototype.get = function (key) {
        var _this = this;
        var deferred = SimplePromise_1.SimplePromise.defer();
        if (!!this.store[key]) {
            deferred.resolve(this.store[key]);
        }
        else {
            console.warn("Waiting for " + key + " to be registered.");
            this.timeouts[key] = setTimeout(function () {
                console.warn("RegistryStore.get timed out after 5 seconds trying to find " + key + ". Make sure the item is registered.");
            }, 5000);
            this.once("registered:" + key, function (cls) {
                clearTimeout(_this.timeouts[key]);
                deferred.resolve(cls);
            });
        }
        return deferred.promise;
    };
    RegistryStore.prototype.getSynchronous = function (key) {
        return this.store[key];
    };
    return RegistryStore;
}(EventDispatcher_1.EventDispatcher));
exports.RegistryStore = RegistryStore;
var Registry = /** @class */ (function (_super) {
    __extends(Registry, _super);
    function Registry() {
        var _this = _super.call(this) || this;
        _this.components = new RegistryStore();
        _this.classes = new RegistryStore();
        _this.models = new RegistryStore();
        _this.templates = new RegistryStore();
        _this.types = new RegistryStore();
        _this.validators = new RegistryStore();
        _this.formats = new RegistryStore();
        _this.attributes = new RegistryStore();
        return _this;
    }
    Registry.component = function (key, setup) {
        if (key === void 0) { key = null; }
        if (setup === void 0) { setup = null; }
        return register('components', key, setup);
    };
    Registry.class = function (key, setup) {
        if (key === void 0) { key = null; }
        if (setup === void 0) { setup = null; }
        return register('classes', key, setup);
    };
    Registry.controller = function (key, setup) {
        if (key === void 0) { key = null; }
        if (setup === void 0) { setup = null; }
        return register('classes', key, setup);
    };
    Registry.model = function (key, setup) {
        if (key === void 0) { key = null; }
        if (setup === void 0) { setup = null; }
        return register('models', key, setup);
    };
    Registry.template = function (key, setup) {
        if (key === void 0) { key = null; }
        if (setup === void 0) { setup = null; }
        return register('templates', key, setup);
    };
    Registry.type = function (key, setup) {
        if (key === void 0) { key = null; }
        if (setup === void 0) { setup = null; }
        return register('types', key, setup);
    };
    Registry.validator = function (key, setup) {
        if (key === void 0) { key = null; }
        if (setup === void 0) { setup = null; }
        return register('validators', key, setup);
    };
    Registry.format = function (key, setup) {
        if (key === void 0) { key = null; }
        if (setup === void 0) { setup = null; }
        return register('formats', key, setup);
    };
    Registry.attribute = function (attributeName, setup) {
        if (attributeName === void 0) { attributeName = null; }
        if (setup === void 0) { setup = null; }
        return register('attributes', attributeName, setup);
    };
    Object.defineProperty(Registry, "instance", {
        get: function () {
            if (!Registry._instance)
                Registry._instance = new Registry();
            return Registry._instance;
        },
        enumerable: false,
        configurable: true
    });
    return Registry;
}(EventDispatcher_1.EventDispatcher));
exports.Registry = Registry;
//# sourceMappingURL=Registry.js.map