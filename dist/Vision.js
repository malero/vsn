"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VOM_1 = require("./VOM");
var Scope_1 = require("./Scope");
var Vision = /** @class */ (function () {
    function Vision() {
        this.scope = new Scope_1.Scope();
        console.log('vision', this.scope);
        document.addEventListener("DOMContentLoaded", this.setup.bind(this));
    }
    Vision.prototype.setup = function () {
        console.log('document ready', this.scope);
        this.vom = new VOM_1.VOM(document, this.scope);
    };
    return Vision;
}());
exports.Vision = Vision;
exports.vision = new Vision();
//# sourceMappingURL=Vision.js.map