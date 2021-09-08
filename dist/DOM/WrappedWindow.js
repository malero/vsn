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
exports.WrappedWindow = void 0;
var DOMObject_1 = require("./DOMObject");
var Scope_1 = require("../Scope");
var WrappedWindow = /** @class */ (function (_super) {
    __extends(WrappedWindow, _super);
    function WrappedWindow(_window) {
        var props = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            props[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, props) || this;
        _this._window = _window;
        _this._scope = new Scope_1.Scope();
        _this.scope.set('@scrollY', _this._window.scrollY);
        _this.scope.set('@scrollX', _this._window.scrollX);
        _window.addEventListener('scroll', _this.onScroll.bind(_this), {
            passive: true
        });
        return _this;
    }
    WrappedWindow.prototype.onScroll = function (e) {
        this.scope.set('@scrollY', this._window.scrollY);
        this.scope.set('@scrollX', this._window.scrollX);
    };
    return WrappedWindow;
}(DOMObject_1.DOMObject));
exports.WrappedWindow = WrappedWindow;
//# sourceMappingURL=WrappedWindow.js.map