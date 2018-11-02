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
var Tag_1 = require("../Tag");
var Scope_1 = require("../Scope");
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Controller.prototype.setup = function () {
        var name = this.attributes['v-name'];
        var value = this.scope.get(name);
        var controllerClassName = this.attributes['v-controller'];
        var cls = window[controllerClassName];
        if (name && !value && cls) {
            this.controllerScope = new Scope_1.Wrapper(new cls(), this.scope);
            this.scope.set(name, this.controllerScope);
        }
        else if (value instanceof Scope_1.Wrapper) {
            this.controllerScope = value;
        }
    };
    return Controller;
}(Tag_1.Tag));
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map