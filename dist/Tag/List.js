"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagList = void 0;
var VisionHelper_1 = require("../helpers/VisionHelper");
var TagList = /** @class */ (function (_super) {
    __extends(TagList, _super);
    function TagList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TagList;
}(Array));
exports.TagList = TagList;
if (VisionHelper_1.VisionHelper.inDevelopment && VisionHelper_1.VisionHelper.window)
    window['TagList'] = TagList;
//# sourceMappingURL=List.js.map