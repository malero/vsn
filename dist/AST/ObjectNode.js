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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectNode = void 0;
var Scope_1 = require("../Scope");
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var ObjectNode = /** @class */ (function (_super) {
    __extends(ObjectNode, _super);
    function ObjectNode(keys, values) {
        var _this = _super.call(this) || this;
        _this.keys = keys;
        _this.values = values;
        return _this;
    }
    ObjectNode.prototype._getChildNodes = function () {
        return new (Array.bind.apply(Array, __spreadArray([void 0], this.values)))();
    };
    ObjectNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var obj, i, key, val, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        obj = new Scope_1.Scope();
                        i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(i < this.values.length)) return [3 /*break*/, 5];
                        key = this.keys[i];
                        val = this.values[i];
                        _b = (_a = obj).set;
                        return [4 /*yield*/, key.evaluate(scope, dom, tag)];
                    case 2:
                        _c = [_d.sent()];
                        return [4 /*yield*/, val.evaluate(scope, dom, tag)];
                    case 3:
                        _b.apply(_a, _c.concat([_d.sent(), true]));
                        _d.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, obj];
                }
            });
        });
    };
    ObjectNode.match = function (tokens) {
        return tokens[0].type === AST_1.TokenType.L_BRACE;
    };
    ObjectNode.parse = function (lastNode, token, tokens) {
        var valueTokens = AST_1.Tree.getNextStatementTokens(tokens);
        var keys = [];
        var values = [];
        while (valueTokens.length > 0) {
            var key = AST_1.Tree.getTokensUntil(valueTokens, AST_1.TokenType.COLON, false);
            if (valueTokens[0].type !== AST_1.TokenType.COLON)
                throw Error('Invalid object literal syntax. Expecting :');
            valueTokens.splice(0, 1); // Consume :
            var val = AST_1.Tree.getTokensUntil(valueTokens, AST_1.TokenType.COMMA, true, false, true, {
                type: AST_1.BlockType.STATEMENT,
                open: null,
                close: null,
                openCharacter: null,
                closeCharacter: null
            });
            keys.push(AST_1.Tree.processTokens(key));
            values.push(AST_1.Tree.processTokens(val));
        }
        return new ObjectNode(keys, values);
    };
    return ObjectNode;
}(Node_1.Node));
exports.ObjectNode = ObjectNode;
//# sourceMappingURL=ObjectNode.js.map