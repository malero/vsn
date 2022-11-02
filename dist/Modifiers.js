"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
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
exports.Modifiers = exports.Modifier = void 0;
var Modifier = /** @class */ (function () {
    function Modifier(modifier) {
        var _a = __read(modifier.split(',')), name = _a[0], args = _a.slice(1);
        this.name = name;
        this.arguments = args;
    }
    Modifier.prototype.getArguments = function (fallback) {
        if (fallback === void 0) { fallback = []; }
        return this.arguments.length ? this.arguments : fallback;
    };
    return Modifier;
}());
exports.Modifier = Modifier;
var Modifiers = /** @class */ (function () {
    function Modifiers(modifiers) {
        var e_1, _a;
        if (modifiers === void 0) { modifiers = []; }
        this.modifiers = new Map();
        try {
            for (var modifiers_1 = __values(modifiers), modifiers_1_1 = modifiers_1.next(); !modifiers_1_1.done; modifiers_1_1 = modifiers_1.next()) {
                var modifier = modifiers_1_1.value;
                this.add(modifier);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (modifiers_1_1 && !modifiers_1_1.done && (_a = modifiers_1.return)) _a.call(modifiers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    Modifiers.prototype.add = function (modifier) {
        var m = new Modifier(modifier);
        this.modifiers.set(m.name, m);
    };
    Modifiers.prototype.has = function (name) {
        return this.modifiers.has(name);
    };
    Modifiers.prototype.get = function (name) {
        return this.modifiers.get(name);
    };
    Object.defineProperty(Modifiers.prototype, "iter", {
        get: function () {
            return Array.from(this.modifiers.values());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Modifiers.prototype, "names", {
        get: function () {
            return this.iter.map(function (m) { return m.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Modifiers.prototype, "length", {
        get: function () {
            return this.modifiers.size;
        },
        enumerable: false,
        configurable: true
    });
    Modifiers.fromAttribute = function (attribute) {
        return new Modifiers(attribute.split('|').splice(1));
    };
    return Modifiers;
}());
exports.Modifiers = Modifiers;
//# sourceMappingURL=Modifiers.js.map