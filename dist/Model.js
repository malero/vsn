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
exports.Model = void 0;
var MessageList_1 = require("./MessageList");
var ScopeData_1 = require("./Scope/ScopeData");
var Model = /** @class */ (function (_super) {
    __extends(Model, _super);
    function Model(data) {
        if (data === void 0) { data = null; }
        var _this = _super.call(this) || this;
        _this._hasErrors = false;
        if (data)
            _this.setData(data);
        _this._lastData = _this.getData();
        _this._constructor();
        return _this;
    }
    Model.prototype._constructor = function () { };
    Model.prototype.validate = function () {
        this._hasErrors = false;
        this._errors = new MessageList_1.MessageList;
        for (var _i = 0, _a = this.getProperties(); _i < _a.length; _i++) {
            var property = _a[_i];
            var errors = this['__' + property].validate();
            if (errors.length > 0) {
                this._errors.add(property, errors, true);
                this._hasErrors = true;
            }
        }
        return this._errors;
    };
    Model.prototype.hasErrors = function () {
        this.validate();
        return this._hasErrors;
    };
    Object.defineProperty(Model.prototype, "errors", {
        get: function () {
            return this._errors;
        },
        enumerable: false,
        configurable: true
    });
    return Model;
}(ScopeData_1.ScopeData));
exports.Model = Model;
//# sourceMappingURL=Model.js.map