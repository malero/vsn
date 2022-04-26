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
exports.DynamicScopeData = void 0;
var ScopeDataAbstract_1 = require("./ScopeDataAbstract");
var DynamicScopeData = /** @class */ (function (_super) {
    __extends(DynamicScopeData, _super);
    function DynamicScopeData(data) {
        var _this = _super.call(this) || this;
        if (data instanceof Array) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var field = data_1[_i];
                _this.createProperty(field);
            }
        }
        else {
            _this.setData(data);
        }
        return _this;
    }
    DynamicScopeData.prototype.setData = function (data) {
        for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
            var field = _a[_i];
            if (!this.hasProperty(field)) {
                this.createProperty(field);
            }
        }
        _super.prototype.setData.call(this, data);
    };
    DynamicScopeData.prototype.on = function (event, fct, context, once) {
        if (event.indexOf('change:') == 0)
            this.createProperty(event.substr(7));
        return _super.prototype.on.call(this, event, fct, context, once);
    };
    return DynamicScopeData;
}(ScopeDataAbstract_1.ScopeDataAbstract));
exports.DynamicScopeData = DynamicScopeData;
//# sourceMappingURL=DynamicScopeData.js.map