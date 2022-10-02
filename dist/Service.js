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
exports.Service = void 0;
var Scope_1 = require("./Scope");
var ScopeObject_1 = require("./Scope/ScopeObject");
var Service = /** @class */ (function (_super) {
    __extends(Service, _super);
    function Service() {
        var _this = _super.call(this) || this;
        _this._scope = new Scope_1.Scope();
        _this._scope.wrap(_this);
        return _this;
    }
    Object.defineProperty(Service.prototype, "scope", {
        get: function () {
            return this._scope;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Service, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new this();
            }
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    return Service;
}(ScopeObject_1.ScopeObject));
exports.Service = Service;
//# sourceMappingURL=Service.js.map