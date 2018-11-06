"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DOM_1 = require("./DOM");
var Vision = /** @class */ (function () {
    function Vision() {
        document.addEventListener("DOMContentLoaded", this.setup.bind(this));
    }
    Vision.prototype.setup = function () {
        this.dom = new DOM_1.DOM(document);
    };
    return Vision;
}());
exports.Vision = Vision;
exports.vision = new Vision();
window['vision'] = exports.vision;
//# sourceMappingURL=Vision.js.map