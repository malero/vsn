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
exports.ScopeData = void 0;
var ScopeDataAbstract_1 = require("./ScopeDataAbstract");
var ScopeData = /** @class */ (function (_super) {
    __extends(ScopeData, _super);
    function ScopeData() {
        var _this = _super.call(this) || this;
        var properties = _this.__properties__.splice(0, _this.__properties__.length);
        for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
            var property = properties_1[_i];
            (function (_self, name) {
                if (!_self['__' + name + '__'])
                    return;
                _self.__properties__.push(name);
                var _property = _self['__' + name + '__'], propertyType = _property[0], config = _property[1] || {};
                _self.createProperty(name, propertyType, config);
            })(_this, property);
        }
        return _this;
    }
    return ScopeData;
}(ScopeDataAbstract_1.ScopeDataAbstract));
exports.ScopeData = ScopeData;
//# sourceMappingURL=ScopeData.js.map