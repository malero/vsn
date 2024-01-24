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
exports.ElementQueryNode = void 0;
var Tag_1 = require("../Tag");
var Node_1 = require("./Node");
var AbstractDOM_1 = require("../DOM/AbstractDOM");
var ElementQueryNode = /** @class */ (function (_super) {
    __extends(ElementQueryNode, _super);
    function ElementQueryNode(query, first, direction) {
        if (first === void 0) { first = false; }
        if (direction === void 0) { direction = AbstractDOM_1.EQuerySelectDirection.ALL; }
        var _this = _super.call(this) || this;
        _this.query = query;
        _this.first = first;
        _this.direction = direction;
        _this.requiresPrep = true;
        return _this;
    }
    ElementQueryNode.prototype.evaluate = function (scope, dom, tag, forceList) {
        if (forceList === void 0) { forceList = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (scope.isGarbage || (tag && tag.state === Tag_1.TagState.Deconstructed))
                            return [2 /*return*/];
                        return [4 /*yield*/, this._evaluate(scope, dom, tag, forceList)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ElementQueryNode.prototype._evaluate = function (scope, dom, tag, forceList) {
        if (tag === void 0) { tag = null; }
        if (forceList === void 0) { forceList = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, elements;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = tag;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, dom.getTagForScope(scope)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        tag = _a;
                        return [4 /*yield*/, dom.get(this.query, true, tag, this.direction)];
                    case 3:
                        elements = _b.sent();
                        return [2 /*return*/, this.first && !forceList ? elements[0] : elements];
                }
            });
        });
    };
    ElementQueryNode.prototype.prepare = function (scope, dom, tag, meta) {
        if (tag === void 0) { tag = null; }
        if (meta === void 0) { meta = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = tag;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, dom.getTagForScope(scope)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        tag = _a;
                        return [4 /*yield*/, dom.get(this.query, true, tag)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ElementQueryNode.parse = function (lastNode, token, tokens) {
        tokens.shift();
        var first = false;
        var direction = AbstractDOM_1.EQuerySelectDirection.ALL;
        if (token.full.startsWith('?>')) {
            direction = AbstractDOM_1.EQuerySelectDirection.DOWN;
        }
        else if (token.full.startsWith('?<')) {
            direction = AbstractDOM_1.EQuerySelectDirection.UP;
            first = true;
        }
        return new ElementQueryNode(token.value, first, direction);
    };
    return ElementQueryNode;
}(Node_1.Node));
exports.ElementQueryNode = ElementQueryNode;
//# sourceMappingURL=ElementQueryNode.js.map