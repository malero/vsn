"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementHelper = void 0;
var ClassNode_1 = require("../AST/ClassNode");
var ElementHelper = /** @class */ (function () {
    function ElementHelper() {
    }
    ElementHelper.hasVisionAttribute = function (element, testAttr) {
        var e_1, _a;
        if (testAttr === void 0) { testAttr = 'vsn-'; }
        if (!element.attributes || element.attributes.length <= 0)
            return false;
        for (var i = 0; i < element.attributes.length; i++) {
            var attr = element.attributes[i];
            if (attr.name.startsWith(testAttr)) {
                return true;
            }
        }
        try {
            for (var _b = __values(Array.from(element.classList)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var cls = _c.value;
                if (ClassNode_1.ClassNode.isClass(cls)) {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
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