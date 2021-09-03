"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formats = void 0;
var Registry_1 = require("./Registry");
var Configuration_1 = require("./Configuration");
var Formats = /** @class */ (function () {
    function Formats() {
    }
    Formats.currency = function (value) {
        if (!Formats.CurrencyFormatter) {
            var setup = function () {
                var locale = Configuration_1.Configuration.get('locale', 'en-US');
                var currency = Configuration_1.Configuration.get('currency', 'USD');
                Formats.CurrencyFormatter = new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: currency
                });
            };
            Configuration_1.Configuration.instance.bind('change:locale', setup);
            Configuration_1.Configuration.instance.bind('change:currency', setup);
            setup();
        }
        value = ("" + value).replace(/[^0-9.]+/, '');
        return Formats.CurrencyFormatter.format(parseFloat(value));
    };
    Formats.date = function (value) {
        return value ? value.toLocaleString() : '';
    };
    __decorate([
        Registry_1.Registry.format('currency')
    ], Formats, "currency", null);
    __decorate([
        Registry_1.Registry.format('date')
    ], Formats, "date", null);
    return Formats;
}());
exports.Formats = Formats;
//# sourceMappingURL=Formats.js.map