"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute_1 = require("../Attribute");
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Controller.prototype.setup = function () {
        var parentScope = this.tag.parent.scope;
        if (!parentScope)
            return;
        var controllerClassName = this.tag.rawAttributes['v-class'];
        var cls = window[controllerClassName];
        this.tag.scope.wrap(new cls());
    };
    return Controller;
}(Attribute_1.Attribute));
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map