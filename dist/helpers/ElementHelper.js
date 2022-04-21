"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementHelper = void 0;
var ElementHelper = /** @class */ (function () {
    function ElementHelper() {
    }
    ElementHelper.hasVisionAttribute = function (element, testAttr) {
        if (testAttr === void 0) { testAttr = 'vsn-'; }
        if (!element.attributes || element.attributes.length <= 0)
            return false;
        for (var i = 0; i < element.attributes.length; i++) {
            var attr = element.attributes[i];
            if (attr.name.startsWith(testAttr)) {
                return true;
            }
        }
        return false;
    };
    ElementHelper.normalizeElementID = function (id) {
        return id ? id.replace(/-([a-zA-Z0-9])/g, function (g) { return g[1].toUpperCase(); }) : null;
    };
    return ElementHelper;
}());
exports.ElementHelper = ElementHelper;
//# sourceMappingURL=ElementHelper.js.map