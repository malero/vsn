"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tag = /** @class */ (function () {
    function Tag(element, scope) {
        this.element = element;
        this.scope = scope;
        this.inputTags = [
            'input',
            'select',
            'textarea'
        ];
        this.parseAttributes();
        this.setup();
    }
    Tag.prototype.parseAttributes = function () {
        this.attributes = {};
        for (var i = 0; i < this.element.attributes.length; i++) {
            var a = this.element.attributes[i];
            if (a.name.substr(0, 2) == 'v-') {
                this.attributes[a.name] = a.value;
            }
        }
    };
    Object.defineProperty(Tag.prototype, "isInput", {
        get: function () {
            return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
        },
        enumerable: true,
        configurable: true
    });
    return Tag;
}());
exports.Tag = Tag;
//# sourceMappingURL=Tag.js.map