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
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    List.prototype.setup = function () {
        this.items = [];
        if (this.tag.element.children.length > 0) {
            this.template = this.tag.element.children[0].cloneNode(true);
        }
        for (var _i = 0, _a = Array.from(this.tag.element.querySelectorAll('[v-list-item]')); _i < _a.length; _i++) {
            var element = _a[_i];
            var tag = this.tag.dom.getTagForElement(element);
            if (tag)
                this.items.push(tag);
        }
        this.tag.scope.set('add', this.newItem.bind(this));
    };
    Object.defineProperty(List.prototype, "listItemName", {
        get: function () {
            return this.tag.rawAttributes['v-list-item-name'] || 'item';
        },
        enumerable: true,
        configurable: true
    });
    List.prototype.newItem = function () {
        var element = this.template.cloneNode(true);
        this.tag.element.appendChild(element);
        this.tag.dom.buildFrom(this.tag.element);
        var tag = this.tag.dom.getTagForElement(element);
        this.items.push(tag);
        var item = tag.scope.get(this.listItemName);
        item.clear();
    };
    return List;
}(Attribute_1.Attribute));
exports.List = List;
//# sourceMappingURL=List.js.map