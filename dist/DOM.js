"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tag_1 = require("./Tag");
var DOM = /** @class */ (function () {
    function DOM(document) {
        this.document = document;
        this.tags = [];
        this.tags.push(new Tag_1.Tag(Array.from(document.getElementsByTagName('body'))[0], this));
        this.buildFrom(document);
    }
    DOM.prototype.buildFrom = function (ele) {
        // Assign parents to each tag
        var allElements = [];
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            allElements.push(tag.element);
        }
        // Create tags for each html element with a v-attribute
        var newTags = [];
        for (var selector in Tag_1.Tag.attributeMap) {
            for (var _b = 0, _c = Array.from(ele.querySelectorAll("[" + selector + "]")); _b < _c.length; _b++) {
                var element = _c[_b];
                if (allElements.indexOf(element) > -1)
                    continue;
                var tag = new Tag_1.Tag(element, this);
                this.tags.push(tag);
                newTags.push(tag);
                allElements.push(element);
            }
        }
        for (var _d = 0, newTags_1 = newTags; _d < newTags_1.length; _d++) {
            var tag = newTags_1[_d];
            // Find closest ancestor
            var parentElement = tag.element.parentElement;
            while (parentElement) {
                if (allElements.indexOf(parentElement) > -1) {
                    tag.parent = this.getTagForElement(parentElement);
                    break;
                }
                parentElement = parentElement.parentElement;
            }
        }
        // Configure & setup attributes
        for (var _e = 0, newTags_2 = newTags; _e < newTags_2.length; _e++) {
            var tag = newTags_2[_e];
            tag.buildAttributes();
        }
        for (var _f = 0, newTags_3 = newTags; _f < newTags_3.length; _f++) {
            var tag = newTags_3[_f];
            tag.setupAttributes();
        }
    };
    DOM.prototype.getTagForElement = function (element) {
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            if (tag.element === element)
                return tag;
        }
        return null;
    };
    return DOM;
}());
exports.DOM = DOM;
//# sourceMappingURL=DOM.js.map