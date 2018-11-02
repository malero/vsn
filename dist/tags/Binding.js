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
var Binding = /** @class */ (function (_super) {
    __extends(Binding, _super);
    function Binding() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Binding.prototype, "value", {
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
    Binding.prototype.setup = function () {
        var ref = this.scope.getReference(this.attributes['v-bind']);
        this.key = ref.key;
        this.boundScope = ref.scope;
        this.boundScope.bind("change:" + this.key, this.updateTo, this);
        if (!this.value)
            this.updateFrom();
        else
            this.updateTo();
        if (this.isInput)
            this.element.onkeyup = this.updateFrom.bind(this);
    };
    Binding.prototype.updateFrom = function () {
        if (this.isInput) {
            this.value = this.element.value;
        }
        else {
            this.value = this.element.innerText;
        }
    };
    Binding.prototype.updateTo = function () {
        if (this.isInput) {
            this.element.value = this.value;
        }
        else {
            this.element.innerText = this.value;
        }
    };
    return Binding;
}(Tag_1.Tag));
exports.Binding = Binding;
//# sourceMappingURL=Binding.js.map