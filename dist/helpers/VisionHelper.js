"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionHelper = void 0;
var VisionHelper = /** @class */ (function () {
    function VisionHelper() {
    }
    VisionHelper.isConstructor = function (obj) {
        return obj &&
            obj.hasOwnProperty("prototype") &&
            !!obj.prototype &&
            !!obj.prototype.constructor &&
            !!obj.prototype.constructor.name;
    };
    return VisionHelper;
}());
exports.VisionHelper = VisionHelper;
//# sourceMappingURL=VisionHelper.js.map