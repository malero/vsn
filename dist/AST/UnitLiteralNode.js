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
exports.UnitLiteralNode = exports.UnitLiteral = void 0;
var LiteralNode_1 = require("./LiteralNode");
var UnitLiteral = /** @class */ (function () {
    function UnitLiteral(_value) {
        this._value = _value;
        this.value = this._value;
    }
    Object.defineProperty(UnitLiteral.prototype, "amount", {
        get: function () {
            return this._amount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UnitLiteral.prototype, "unit", {
        get: function () {
            return this._unit;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UnitLiteral.prototype, "value", {
        get: function () {
            return "" + this._amount + this._unit;
        },
        set: function (value) {
            if (value.indexOf('.') > -1) {
                this._amount = parseFloat(value);
            }
            else {
                this._amount = parseInt(value);
            }
            if (isNaN(this._amount))
                this._amount = 0;
            var unit = /[^\d.]+$/.exec(value);
            this._unit = unit && unit[0] || '';
        },
        enumerable: false,
        configurable: true
    });
    UnitLiteral.prototype.toString = function () {
        return this.value;
    };
    return UnitLiteral;
}());
exports.UnitLiteral = UnitLiteral;
var UnitLiteralNode = /** @class */ (function (_super) {
    __extends(UnitLiteralNode, _super);
    function UnitLiteralNode(_value) {
        return _super.call(this, new UnitLiteral(_value)) || this;
    }
    return UnitLiteralNode;
}(LiteralNode_1.LiteralNode));
exports.UnitLiteralNode = UnitLiteralNode;
//# sourceMappingURL=UnitLiteralNode.js.map