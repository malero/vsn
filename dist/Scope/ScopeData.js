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
exports.ScopeData = void 0;
var ScopeDataAbstract_1 = require("./ScopeDataAbstract");
var ScopeData = /** @class */ (function (_super) {
    __extends(ScopeData, _super);
    function ScopeData() {
        var e_1, _a;
        var _this = _super.call(this) || this;
        var properties = _this.__properties__.splice(0, _this.__properties__.length);
        try {
            for (var properties_1 = __values(properties), properties_1_1 = properties_1.next(); !properties_1_1.done; properties_1_1 = properties_1.next()) {
                var property = properties_1_1.value;
                (function (_self, name) {
                    if (!_self['__' + name + '__'])
                        return;
                    var _property = _self['__' + name + '__'], propertyType = _property[0], config = _property[1] || {};
                    _self.createProperty(name, propertyType, config);
                })(_this, property);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (properties_1_1 && !properties_1_1.done && (_a = properties_1.return)) _a.call(properties_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return _this;
    }
    return ScopeData;
}(ScopeDataAbstract_1.ScopeDataAbstract));
exports.ScopeData = ScopeData;
//# sourceMappingURL=ScopeData.js.map