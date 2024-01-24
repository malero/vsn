"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
var Tag_1 = require("../Tag");
var AST_1 = require("../AST");
var Modifiers_1 = require("../Modifiers");
var Node = /** @class */ (function () {
    function Node() {
        this.requiresPrep = false;
        this.nodeCache = {};
        this.modifiers = new Modifiers_1.Modifiers();
    }
    Node.prototype.evaluate = function (scope, dom, tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (scope.isGarbage || (tag && tag.state === Tag_1.TagState.Deconstructed))
                            return [2 /*return*/];
                        return [4 /*yield*/, this._evaluate(scope, dom, tag)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Node.prototype._evaluate = function (scope, dom, tag) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Node.prototype.isPreparationRequired = function () {
        var e_1, _a;
        if (this.requiresPrep)
            return true;
        if (this._isPreparationRequired !== undefined)
            return this._isPreparationRequired;
        try {
            for (var _b = __values(this.getChildNodes()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var node = _c.value;
                if (node.isPreparationRequired()) {
                    this._isPreparationRequired = true;
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
    Node.prototype.prepare = function (scope, dom, tag, meta) {
        if (tag === void 0) { tag = null; }
        if (meta === void 0) { meta = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, node, e_2_1;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.getChildNodes()), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        node = _b.value;
                        return [4 /*yield*/, node.prepare(scope, dom, tag, meta)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.cleanup = function (scope, dom, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, node, e_3_1;
            var e_3, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = __values(this.getChildNodes()), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        node = _b.value;
                        return [4 /*yield*/, node.cleanup(scope, dom, tag)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype._getChildNodes = function () {
        return [];
    };
    Node.prototype.getChildNodes = function () {
        if (this.childNodes === undefined) {
            this.childNodes = this._getChildNodes();
        }
        return this.childNodes;
    };
    Node.prototype.findChildrenByType = function (t) {
        return this.findChildrenByTypes([t]);
    };
    Node.prototype.findChildrenByTypes = function (types, cacheKey) {
        var e_4, _a, e_5, _b;
        if (cacheKey === void 0) { cacheKey = null; }
        if (cacheKey !== null && this.nodeCache[cacheKey])
            return this.nodeCache[cacheKey];
        var nodes = [];
        try {
            for (var _c = __values(this.getChildNodes()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var child = _d.value;
                try {
                    for (var types_1 = (e_5 = void 0, __values(types)), types_1_1 = types_1.next(); !types_1_1.done; types_1_1 = types_1.next()) {
                        var t = types_1_1.value;
                        if (child instanceof t)
                            nodes.push(child);
                        var childNodes = child.findChildrenByType(t);
                        nodes.push.apply(nodes, __spreadArray([], __read(childNodes)));
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (types_1_1 && !types_1_1.done && (_b = types_1.return)) _b.call(types_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (cacheKey !== null)
            this.nodeCache[cacheKey] = nodes;
        return nodes;
    };
    Node.prototype.hasModifier = function (modifier) {
        return this.modifiers.has(modifier);
    };
    Node.moveModifiers = function (from, to) {
        if (to === void 0) { to = null; }
        to = to || [];
        if (from && from.length) {
            while (from[0] && from[0].type == AST_1.TokenType.MODIFIER) {
                to.unshift(from.shift());
            }
        }
        return to;
    };
    return Node;
}());
exports.Node = Node;
//# sourceMappingURL=Node.js.map