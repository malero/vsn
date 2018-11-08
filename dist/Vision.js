"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DOM_1 = require("./DOM");
var ast_1 = require("./ast");
var Scope_1 = require("./Scope");
var Vision = /** @class */ (function () {
    function Vision() {
        document.addEventListener("DOMContentLoaded", this.setup.bind(this));
    }
    Vision.prototype.setup = function () {
        this.dom = new DOM_1.DOM(document);
    };
    Vision.prototype.parse = function (str) {
        var scope = new Scope_1.Scope();
        scope.set('test', {
            testing: 'Worky?'
        });
        scope.set('func', function () {
            console.log('called func');
            return 'testing';
        });
        var t = new ast_1.Tree(str);
        return t.evaluate(scope);
    };
    return Vision;
}());
exports.Vision = Vision;
exports.vision = new Vision();
window['vision'] = exports.vision;
//# sourceMappingURL=Vision.js.map