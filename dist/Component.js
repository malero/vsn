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
exports.Component = void 0;
var Registry_1 = require("./Registry");
var DOM_1 = require("./DOM");
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component() {
        var _this = _super.call(this) || this;
        Object.setPrototypeOf(_this, Component.prototype);
        _this.shadow = _this.attachShadow({ mode: 'open' });
        var templateId = _this.getAttribute('template');
        var template;
        if (templateId) {
            template = document.getElementById(templateId);
        }
        else {
            template = Registry_1.Registry.instance.templates.getSynchronous(_this.tagName.toLowerCase());
        }
        _this.setAttribute('vsn-ref', '');
        _this.shadow.appendChild(template.content.cloneNode(true));
        DOM_1.DOM.instance.buildFrom(_this.shadow);
        return _this;
    }
    return Component;
}(HTMLElement));
exports.Component = Component;
//# sourceMappingURL=Component.js.map