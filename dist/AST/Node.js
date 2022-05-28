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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
var Node = /** @class */ (function () {
    function Node() {
        this.requiresPrep = false;
        this.nodeCache = {};
        this.modifiers = [];
    }
    Node.prototype.isPreparationRequired = function () {
        if (this.requiresPrep)
            return true;
        if (this._isPreparationRequired !== undefined)
            return this._isPreparationRequired;
        for (var _i = 0, _a = this.getChildNodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.isPreparationRequired()) {
                this._isPreparationRequired = true;
                return true;
            }
        }
        return false;
    };
    Node.prototype.prepare = function (scope, dom, tag, meta) {
        if (tag === void 0) { tag = null; }
        if (meta === void 0) { meta = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.getChildNodes();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        node = _a[_i];
                        return [4 /*yield*/, node.prepare(scope, dom, tag, meta)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Node.prototype.cleanup = function (scope, dom, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, node;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.getChildNodes();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        node = _a[_i];
                        return [4 /*yield*/, node.cleanup(scope, dom, tag)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
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
        if (cacheKey === void 0) { cacheKey = null; }
        if (cacheKey !== null && this.nodeCache[cacheKey])
            return this.nodeCache[cacheKey];
        var nodes = [];
        for (var _i = 0, _a = this.getChildNodes(); _i < _a.length; _i++) {
            var child = _a[_i];
            for (var _b = 0, types_1 = types; _b < types_1.length; _b++) {
                var t = types_1[_b];
                if (child instanceof t)
                    nodes.push(child);
                var childNodes = child.findChildrenByType(t);
                nodes.push.apply(nodes, childNodes);
            }
        }
        if (cacheKey !== null)
            this.nodeCache[cacheKey] = nodes;
        return nodes;
    };
    return Node;
}());
exports.Node = Node;
//# sourceMappingURL=Node.js.map