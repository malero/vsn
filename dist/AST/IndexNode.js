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
exports.IndexNode = void 0;
var Scope_1 = require("../Scope");
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var IndexNode = /** @class */ (function (_super) {
    __extends(IndexNode, _super);
    function IndexNode(object, index, indexTwo) {
        if (indexTwo === void 0) { indexTwo = null; }
        var _this = _super.call(this) || this;
        _this.object = object;
        _this.index = index;
        _this.indexTwo = indexTwo;
        return _this;
    }
    IndexNode.prototype._getChildNodes = function () {
        var children = [
            this.object,
            this.index
        ];
        if (this.indexTwo)
            children.push(this.indexTwo);
        return children;
    };
    IndexNode.prototype.negativeIndex = function (obj, index) {
        if (Number.isFinite(index) && index < 0)
            return obj.length + index;
        return index;
    };
    IndexNode.prototype._evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var obj, index, _a, _b, indexTwo, _c, _d, values, i;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.object.evaluate(scope, dom, tag)];
                    case 1:
                        obj = _e.sent();
                        _a = this.negativeIndex;
                        _b = [obj];
                        return [4 /*yield*/, this.index.evaluate(scope, dom, tag)];
                    case 2:
                        index = _a.apply(this, _b.concat([_e.sent()]));
                        if (!(Number.isFinite(index) && this.indexTwo)) return [3 /*break*/, 4];
                        _c = this.negativeIndex;
                        _d = [obj];
                        return [4 /*yield*/, this.indexTwo.evaluate(scope, dom, tag)];
                    case 3:
                        indexTwo = _c.apply(this, _d.concat([_e.sent()]));
                        values = [];
                        for (i = index; i <= indexTwo; i++) {
                            values.push(obj[i]);
                        }
                        return [2 /*return*/, values];
                    case 4:
                        if (obj instanceof Scope_1.Scope) {
                            return [2 /*return*/, obj.get(index)];
                        }
                        return [2 /*return*/, (obj)[index]];
                }
            });
        });
    };
    IndexNode.match = function (tokens) {
        return tokens[0].type === AST_1.TokenType.L_BRACKET;
    };
    IndexNode.parse = function (lastNode, token, tokens) {
        var e_1, _a;
        var valueTokens = AST_1.Tree.getBlockTokens(tokens, AST_1.TokenType.COLON);
        var values = [];
        try {
            for (var valueTokens_1 = __values(valueTokens), valueTokens_1_1 = valueTokens_1.next(); !valueTokens_1_1.done; valueTokens_1_1 = valueTokens_1.next()) {
                var arg = valueTokens_1_1.value;
                values.push(AST_1.Tree.processTokens(arg));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (valueTokens_1_1 && !valueTokens_1_1.done && (_a = valueTokens_1.return)) _a.call(valueTokens_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return new IndexNode(lastNode, values[0], values.length > 1 && values[1]);
    };
    return IndexNode;
}(Node_1.Node));
exports.IndexNode = IndexNode;
//# sourceMappingURL=IndexNode.js.map