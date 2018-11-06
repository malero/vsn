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
var Click = /** @class */ (function (_super) {
    __extends(Click, _super);
    function Click() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Click.prototype.setup = function () {
        var click = this.tag.rawAttributes['v-click'];
        var ref = this.tag.scope.getReference(click);
        this.onClickHandler = ref.value;
        this.tag.element.onclick = this.onClick.bind(this);
    };
    Click.prototype.onClick = function () {
        if (this.onClickHandler)
            this.onClickHandler();
    };
    return Click;
}(Attribute_1.Attribute));
exports.Click = Click;
//# sourceMappingURL=Click.js.map