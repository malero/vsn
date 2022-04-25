"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validators = void 0;
var Registry_1 = require("./Registry");
var Validators = /** @class */ (function () {
    function Validators() {
    }
    Validators.email = function (value) {
        var errors = [];
        if (value != null && !this._emailRegex.test(value))
            errors.push('Please enter a valid email address');
        return errors;
    };
    Validators._emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    __decorate([
        Registry_1.Registry.validator('email')
    ], Validators, "email", null);
    return Validators;
}());
exports.Validators = Validators;
//# sourceMappingURL=Validators.js.map