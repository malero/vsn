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
exports.DynamicScopeData = void 0;
var ScopeDataAbstract_1 = require("./ScopeDataAbstract");
var DynamicScopeData = /** @class */ (function (_super) {
    __extends(DynamicScopeData, _super);
    function DynamicScopeData(data) {
        var e_1, _a;
        var _this = _super.call(this) || this;
        if (data instanceof Array) {
            try {
                for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                    var field = data_1_1.value;
                    _this.createProperty(field);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else {
            _this.setData(data);
        }
        return _this;
    }
    DynamicScopeData.prototype.setData = function (data) {
        var e_2, _a;
        try {
            for (var _b = __values(Object.keys(data)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var field = _c.value;
                if (!this.hasProperty(field)) {
                    this.createProperty(field);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
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