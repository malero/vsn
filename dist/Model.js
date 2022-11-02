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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
var MessageList_1 = require("./MessageList");
var ScopeData_1 = require("./Scope/ScopeData");
var Registry_1 = require("./Registry");
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
        var e_1, _a;
        this._hasErrors = false;
        this._errors = new MessageList_1.MessageList;
        try {
            for (var _b = __values(this.getProperties()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var property = _c.value;
                var errors = this['__' + property].validate();
                if (errors.length > 0) {
                    this._errors.add(property, errors, true);
                    this._hasErrors = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
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
    Model = __decorate([
        Registry_1.Registry.model('Model')
    ], Model);
    return Model;
}(ScopeData_1.ScopeData));
exports.Model = Model;
//# sourceMappingURL=Model.js.map