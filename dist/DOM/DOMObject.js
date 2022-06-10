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
exports.DOMObject = void 0;
var EventDispatcher_1 = require("../EventDispatcher");
var DOMObject = /** @class */ (function (_super) {
    __extends(DOMObject, _super);
    function DOMObject(element, props) {
        var _a;
        var _this = _super.call(this) || this;
        _this.element = element;
        _this._uniqueScope = false;
        _this.delegates = [];
        if (_this.isSlot) {
            (_a = _this.delegates).push.apply(_a, element.assignedNodes());
        }
        if (element.assignedSlot) {
            _this.slot = element.assignedSlot;
        }
        return _this;
    }
    Object.defineProperty(DOMObject.prototype, "isSlot", {
        get: function () {
            return this.element instanceof HTMLSlotElement;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DOMObject.prototype, "scope", {
        get: function () {
            if (!!this._scope)
                return this._scope;
            return null;
        },
        set: function (scope) {
            this._scope = scope;
        },
        enumerable: false,
        configurable: true
    });
    DOMObject.prototype.watchAttribute = function (attr) {
    };
    DOMObject.prototype.watchStyle = function (style) {
    };
    DOMObject.prototype.deconstruct = function () {
        var _a;
        if (this._uniqueScope)
            (_a = this.scope) === null || _a === void 0 ? void 0 : _a.deconstruct();
        _super.prototype.deconstruct.call(this);
    };
    return DOMObject;
}(EventDispatcher_1.EventDispatcher));
exports.DOMObject = DOMObject;
//# sourceMappingURL=DOMObject.js.map