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
exports.DOM = void 0;
var AbstractDOM_1 = require("./DOM/AbstractDOM");
var DOM = /** @class */ (function (_super) {
    __extends(DOM, _super);
    function DOM() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(DOM, "instance", {
        get: function () {
            if (!DOM._instance)
                DOM._instance = new DOM(document.body, false, false);
            return DOM._instance;
        },
        enumerable: false,
        configurable: true
    });
    return DOM;
}(AbstractDOM_1.AbstractDOM));
exports.DOM = DOM;
//# sourceMappingURL=DOM.js.map