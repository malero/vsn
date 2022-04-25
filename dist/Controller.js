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
exports.Controller = void 0;
var ScopeData_1 = require("./Scope/ScopeData");
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Controller.prototype, "scope", {
        get: function () {
            return this._scope;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Controller.prototype, "tag", {
        get: function () {
            return this._tag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Controller.prototype, "element", {
        get: function () {
            return this._element;
        },
        enumerable: false,
        configurable: true
    });
    Controller.prototype.init = function (scope, tag, element) {
        this._scope = scope;
        this._tag = tag;
        this._element = element;
    };
    Controller.prototype.get = function (key) {
        var _a;
        return (_a = this._scope) === null || _a === void 0 ? void 0 : _a.get(key);
    };
    Controller.prototype.set = function (key, value) {
        var _a;
        (_a = this._scope) === null || _a === void 0 ? void 0 : _a.set(key, value);
    };
    return Controller;
}(ScopeData_1.ScopeData));
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map