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
var Name = /** @class */ (function (_super) {
    __extends(Name, _super);
    function Name() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Name.prototype.setup = function () {
        var parentScope = this.tag.scope.parent;
        if (parentScope)
            parentScope.set(this.tag.rawAttributes['v-name'], this.tag.scope);
    };
    return Name;
}(Attribute_1.Attribute));
exports.Name = Name;
//# sourceMappingURL=Name.js.map