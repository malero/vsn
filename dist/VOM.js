"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Controller_1 = require("./tags/Controller");
var Binding_1 = require("./tags/Binding");
var Click_1 = require("./tags/Click");
var VOM = /** @class */ (function () {
    function VOM($document, scope) {
        this.$document = $document;
        this.scope = scope;
        this.tags = [];
        for (var selector in VOM.tagMap) {
            for (var _i = 0, _a = Array.from($document.querySelectorAll(selector)); _i < _a.length; _i++) {
                var element = _a[_i];
                this.tags.push(new VOM.tagMap[selector](element, scope));
            }
        }
    }
    VOM.tagMap = {
        '[v-controller]': Controller_1.Controller,
        '[v-bind]': Binding_1.Binding,
        '[v-click]': Click_1.Click
    };
    return VOM;
}());
exports.VOM = VOM;
//# sourceMappingURL=VOM.js.map