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
exports.Field = void 0;
var Property_1 = require("../Scope/properties/Property");
var Registry_1 = require("../Registry");
var Field = /** @class */ (function (_super) {
    __extends(Field, _super);
    function Field() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Field.prototype.validate = function () {
        var errors = [];
        for (var _i = 0, _a = this.config.validators || []; _i < _a.length; _i++) {
            var validatorName = _a[_i];
            var validator = Registry_1.Registry.instance.validators.getSynchronous(validatorName);
            errors.concat(validator(this.value));
        }
        return errors;
    };
    return Field;
}(Property_1.Property));
exports.Field = Field;
//# sourceMappingURL=Field.js.map