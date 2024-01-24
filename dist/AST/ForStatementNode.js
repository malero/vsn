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
exports.ForStatementNode = void 0;
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var LiteralNode_1 = require("./LiteralNode");
var ForStatementNode = /** @class */ (function (_super) {
    __extends(ForStatementNode, _super);
    function ForStatementNode(variable, list, block) {
        var _this = _super.call(this) || this;
        _this.variable = variable;
        _this.list = list;
        _this.block = block;
        return _this;
    }
    ForStatementNode.prototype._getChildNodes = function () {
        return [
            this.variable,
            this.list,
            this.block
        ];
    };
    ForStatementNode.prototype._evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var variable, list, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.variable.evaluate(scope, dom, tag)];
                    case 1:
                        variable = _a.sent();
                        return [4 /*yield*/, this.list.evaluate(scope, dom, tag)];
                    case 2:
                        list = _a.sent();
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < list.length)) return [3 /*break*/, 6];
                        scope.set(variable, list[i]);
                        return [4 /*yield*/, this.block.evaluate(scope, dom, tag)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, null];
                }
            });
        });
    };
    ForStatementNode.parse = function (lastNode, token, tokens) {
        if (tokens[1].type !== AST_1.TokenType.L_PAREN) {
            throw SyntaxError('Syntax error: Missing (');
        }
        if (tokens[3].type !== AST_1.TokenType.OF) {
            throw SyntaxError('Syntax error: Missing of');
        }
        tokens.splice(0, 1); // consume for
        var loopDef = AST_1.Tree.getNextStatementTokens(tokens);
        var variableName = loopDef.splice(0, 1)[0];
        loopDef.splice(0, 1); // consume of
        var list = AST_1.Tree.processTokens(loopDef);
        var block = AST_1.Tree.processTokens(AST_1.Tree.getBlockTokens(tokens, null)[0]);
        return new ForStatementNode(new LiteralNode_1.LiteralNode(variableName.value), list, block);
    };
    return ForStatementNode;
}(Node_1.Node));
exports.ForStatementNode = ForStatementNode;
//# sourceMappingURL=ForStatementNode.js.map