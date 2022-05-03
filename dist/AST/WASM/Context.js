"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WASMContext = void 0;
var WASMContext = /** @class */ (function () {
    function WASMContext() {
    }
    WASMContext.prototype.addName = function (name) {
        var index = this.names.indexOf(name);
        if (index == -1) {
            index = this.names.length;
            this.names.push(name);
        }
        return index;
    };
    return WASMContext;
}());
exports.WASMContext = WASMContext;
//# sourceMappingURL=Context.js.map