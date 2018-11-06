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
var Bind = /** @class */ (function (_super) {
    __extends(Bind, _super);
    function Bind() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Bind.prototype, "value", {
        get: function () {
            if (!this.boundScope)
                return null;
            return this.boundScope.get(this.key);
        },
        set: function (v) {
            if (this.boundScope) {
                this.boundScope.set(this.key, v);
            }
        },
        enumerable: true,
        configurable: true
    });
    Bind.prototype.setup = function () {
        var ref = this.tag.scope.getReference(this.tag.rawAttributes['v-bind']);
        this.key = ref.key;
        this.boundScope = ref.scope;
        this.boundScope.bind("change:" + this.key, this.updateTo, this);
        if (!this.value)
            this.updateFrom();
        else
            this.updateTo();
        if (this.tag.isInput)
            this.tag.element.onkeyup = this.updateFrom.bind(this);
    };
    Bind.prototype.updateFrom = function () {
        if (this.tag.isInput) {
            this.value = this.tag.element.value;
        }
        else {
            this.value = this.tag.element.innerText;
        }
    };
    Bind.prototype.updateTo = function () {
        if (this.tag.isInput) {
            this.tag.element.value = this.value;
        }
        else {
            this.tag.element.innerText = this.value;
        }
    };
    return Bind;
}(Attribute_1.Attribute));
exports.Bind = Bind;
//# sourceMappingURL=Bind.js.map