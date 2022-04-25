"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Types = void 0;
var Registry_1 = require("./Registry");
var Types = /** @class */ (function () {
    function Types() {
    }
    Types.any = function (value) {
        return value;
    };
    Types.string = function (value) {
        return value;
    };
    Types.integer = function (value) {
        return parseInt(value);
    };
    Types.float = function (value) {
        value = ("" + value).replace(/[^0-9.]+/, '');
        return parseFloat(value);
    };
    Types.boolean = function (value) {
        return [0, '0', 'false', ''].indexOf(value) === -1;
    };
    Types.date = function (value) {
        return new Date(Date.parse(value));
    };
    __decorate([
        Registry_1.Registry.type('any')
    ], Types, "any", null);
    __decorate([
        Registry_1.Registry.type('string')
    ], Types, "string", null);
    __decorate([
        Registry_1.Registry.type('integer')
    ], Types, "integer", null);
    __decorate([
        Registry_1.Registry.type('float')
    ], Types, "float", null);
    __decorate([
        Registry_1.Registry.type('boolean')
    ], Types, "boolean", null);
    __decorate([
        Registry_1.Registry.type('date')
    ], Types, "date", null);
    return Types;
}());
exports.Types = Types;
//# sourceMappingURL=Types.js.map