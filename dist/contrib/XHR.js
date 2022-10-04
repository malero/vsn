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
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHR = void 0;
var Registry_1 = require("../Registry");
var Service_1 = require("../Service");
var Property_1 = require("../Scope/properties/Property");
var XHR = /** @class */ (function (_super) {
    __extends(XHR, _super);
    function XHR() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.siteHeaders = {};
        _this.siteFormData = {};
        return _this;
    }
    XHR.prototype.addHeader = function (key, value, site) {
        if (site === void 0) { site = null; }
        if (site === null)
            site = window.location.hostname;
        if (!this.siteHeaders[site]) {
            this.siteHeaders[site] = {};
        }
        this.siteHeaders[site][key] = value;
    };
    XHR.prototype.addFormData = function (key, value, site) {
        if (site === void 0) { site = null; }
        if (site === null)
            site = window.location.hostname;
        if (!this.siteFormData[site]) {
            this.siteFormData[site] = {};
        }
        this.siteFormData[site][key] = value;
    };
    XHR.prototype.getHeaders = function (site) {
        if (site === void 0) { site = null; }
        if (site === null)
            site = window.location.hostname;
        return this.siteHeaders[site];
    };
    XHR.prototype.getFormData = function (site) {
        if (site === void 0) { site = null; }
        if (site === null)
            site = window.location.hostname;
        return this.siteFormData[site];
    };
    __decorate([
        Property_1.property()
    ], XHR.prototype, "siteHeaders", void 0);
    __decorate([
        Property_1.property()
    ], XHR.prototype, "siteFormData", void 0);
    XHR = __decorate([
        Registry_1.Registry.service('XHR')
    ], XHR);
    return XHR;
}(Service_1.Service));
exports.XHR = XHR;
//# sourceMappingURL=XHR.js.map