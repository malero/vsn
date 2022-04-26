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
exports.ArithmeticAssignmentNode = void 0;
var Scope_1 = require("../Scope");
var DOMObject_1 = require("../DOM/DOMObject");
var AST_1 = require("../AST");
var Node_1 = require("./Node");
var RootScopeMemberNode_1 = require("./RootScopeMemberNode");
var ScopeMemberNode_1 = require("./ScopeMemberNode");
var ElementQueryNode_1 = require("./ElementQueryNode");
var ElementAttributeNode_1 = require("./ElementAttributeNode");
var ElementStyleNode_1 = require("./ElementStyleNode");
var UnitLiteralNode_1 = require("./UnitLiteralNode");
var vsn_1 = require("../vsn");
var ArithmeticAssignmentNode = /** @class */ (function (_super) {
    __extends(ArithmeticAssignmentNode, _super);
    function ArithmeticAssignmentNode(left, right, type) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.right = right;
        _this.type = type;
        return _this;
    }
    ArithmeticAssignmentNode.prototype._getChildNodes = function () {
        return [
            this.left,
            this.right
        ];
    };
    ArithmeticAssignmentNode.prototype.evaluate = function (scope, dom, tag) {
        if (tag === void 0) { tag = null; }
        return __awaiter(this, void 0, void 0, function () {
            var scopes, name, inner, elements, values, _i, scopes_1, localScope, left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scopes = [];
                        return [4 /*yield*/, this.left.name.evaluate(scope, dom, tag)];
                    case 1:
                        name = _a.sent();
                        if (!(this.left instanceof ScopeMemberNode_1.ScopeMemberNode)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.left.scope.evaluate(scope, dom, tag)];
                    case 2:
                        inner = _a.sent();
                        if (this.left.scope instanceof ElementQueryNode_1.ElementQueryNode) {
                            if (this.left.scope.first) {
                                scopes.push(inner);
                            }
                            else {
                                scopes.push.apply(scopes, inner);
                            }
                        }
                        else if (inner instanceof Scope_1.Scope) {
                            scopes.push(inner);
                        }
                        else if (inner instanceof vsn_1.Controller) {
                            scopes.push(inner.scope);
                        }
                        else {
                            scopes.push(scope);
                        }
                        return [3 /*break*/, 6];
                    case 3:
                        if (!((this.left instanceof ElementAttributeNode_1.ElementAttributeNode || this.left instanceof ElementStyleNode_1.ElementStyleNode) && this.left.elementRef)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.left.elementRef.evaluate(scope, dom, tag)];
                    case 4:
                        elements = _a.sent();
                        if (this.left.elementRef.first) {
                            scopes.push(elements);
                        }
                        else {
                            scopes = elements;
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        scopes.push(scope);
                        _a.label = 6;
                    case 6:
                        values = [];
                        _i = 0, scopes_1 = scopes;
                        _a.label = 7;
                    case 7:
                        if (!(_i < scopes_1.length)) return [3 /*break*/, 13];
                        localScope = scopes_1[_i];
                        if (!(localScope instanceof DOMObject_1.DOMObject)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.handleDOMObject(name, dom, localScope, tag)];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 9:
                        if (localScope['$wrapped'] && localScope['$scope']) {
                            localScope = localScope['$scope'];
                        }
                        return [4 /*yield*/, this.left.evaluate(scope, dom, tag)];
                    case 10:
                        left = _a.sent();
                        return [4 /*yield*/, this.right.evaluate(scope, dom, tag)];
                    case 11:
                        right = _a.sent();
                        if (left instanceof Array) {
                            left = this.handleArray(name, left, right, localScope);
                        }
                        else if (left instanceof UnitLiteralNode_1.UnitLiteral || right instanceof UnitLiteralNode_1.UnitLiteral) {
                            left = this.handleUnit(name, left, right, localScope);
                        }
                        else if (Number.isFinite(left)) {
                            left = this.handleNumber(name, left, right, localScope);
                        }
                        else {
                            left = this.handleString(name, left, right, localScope);
                        }
                        values.push(left);
                        _a.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 7];
                    case 13: return [2 /*return*/, values.length > 1 ? values : values[0]];
                }
            });
        });
    };
    ArithmeticAssignmentNode.prototype.handleNumber = function (key, left, right, scope) {
        if (right !== null && !Number.isFinite(right))
            right = parseFloat("" + right);
        left = left;
        right = right;
        switch (this.type) {
            case AST_1.TokenType.ASSIGN:
                left = right;
                break;
            case AST_1.TokenType.ADD_ASSIGN:
                left += right;
                break;
            case AST_1.TokenType.SUBTRACT_ASSIGN:
                left -= right;
                break;
            case AST_1.TokenType.MULTIPLY_ASSIGN:
                left *= right;
                break;
            case AST_1.TokenType.DIVIDE_ASSIGN:
                left /= right;
                break;
        }
        scope.set(key, left);
        return left;
    };
    ArithmeticAssignmentNode.prototype.handleString = function (key, left, right, scope) {
        switch (this.type) {
            case AST_1.TokenType.ASSIGN:
                left = right;
                break;
            case AST_1.TokenType.ADD_ASSIGN:
                left = "" + left + right;
                break;
            case AST_1.TokenType.SUBTRACT_ASSIGN:
                left.replace(right, '');
                break;
            case AST_1.TokenType.MULTIPLY_ASSIGN:
                left *= right;
                break;
            case AST_1.TokenType.DIVIDE_ASSIGN:
                left /= right;
                break;
        }
        scope.set(key, left);
        return left;
    };
    ArithmeticAssignmentNode.prototype.handleUnit = function (key, left, right, scope) {
        if (!(left instanceof UnitLiteralNode_1.UnitLiteral)) {
            left = new UnitLiteralNode_1.UnitLiteral(left);
        }
        if (!(right instanceof UnitLiteralNode_1.UnitLiteral)) {
            right = new UnitLiteralNode_1.UnitLiteral(right);
        }
        var unit = left.unit || right.unit || 'px';
        switch (this.type) {
            case AST_1.TokenType.ASSIGN:
                left = right;
                break;
            case AST_1.TokenType.ADD_ASSIGN:
                left = new UnitLiteralNode_1.UnitLiteral("" + (left.amount + right.amount) + unit);
                break;
            case AST_1.TokenType.SUBTRACT_ASSIGN:
                left = new UnitLiteralNode_1.UnitLiteral("" + (left.amount - right.amount) + unit);
                break;
            case AST_1.TokenType.MULTIPLY_ASSIGN:
                left = new UnitLiteralNode_1.UnitLiteral("" + left.amount * right.amount + unit);
                break;
            case AST_1.TokenType.DIVIDE_ASSIGN:
                left = new UnitLiteralNode_1.UnitLiteral("" + left.amount / right.amount + unit);
                break;
        }
        scope.set(key, left);
        return left;
    };
    ArithmeticAssignmentNode.prototype.handleDOMObject = function (key, dom, domObject, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var left, right;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        left = domObject.scope.get(key);
                        return [4 /*yield*/, this.right.evaluate(domObject.scope, dom, tag)];
                    case 1:
                        right = _a.sent();
                        if (left instanceof Array)
                            return [2 /*return*/, this.handleArray(key, left, right, domObject.scope)];
                        return [2 /*return*/, this.handleString(key, left, right, domObject.scope)];
                }
            });
        });
    };
    ArithmeticAssignmentNode.prototype.handleArray = function (key, left, right, scope) {
        if (!(right instanceof Array))
            right = [right];
        switch (this.type) {
            case AST_1.TokenType.ASSIGN:
                left.splice(0, left.length);
                left.push.apply(left, right);
                break;
            case AST_1.TokenType.ADD_ASSIGN:
                left.push.apply(left, right);
                break;
            case AST_1.TokenType.SUBTRACT_ASSIGN:
                for (var i = left.length - 1; i >= 0; i--) {
                    if (right.indexOf(left[i]) > -1) {
                        left.splice(i, 1);
                        i++;
                    }
                }
                break;
            case AST_1.TokenType.TILDE:
                for (var _i = 0, right_1 = right; _i < right_1.length; _i++) {
                    var toggle = right_1[_i];
                    var index = left.indexOf(toggle);
                    if (index > -1) {
                        left.splice(index, 1);
                    }
                    else {
                        left.push(toggle);
                    }
                }
                break;
        }
        /*
         We have to trigger a change manually here. Setting the variable on the scope with an array won't trigger
         it since we are modifying values inside of the array instance.
         */
        scope.dispatch("change:" + key);
        return left;
    };
    ArithmeticAssignmentNode.match = function (tokens) {
        return [
            AST_1.TokenType.ASSIGN,
            AST_1.TokenType.ADD_ASSIGN,
            AST_1.TokenType.SUBTRACT_ASSIGN,
            AST_1.TokenType.MULTIPLY_ASSIGN,
            AST_1.TokenType.DIVIDE_ASSIGN,
            AST_1.TokenType.TILDE,
        ].indexOf(tokens[0].type) > -1;
    };
    ArithmeticAssignmentNode.parse = function (lastNode, token, tokens) {
        if (!(lastNode instanceof RootScopeMemberNode_1.RootScopeMemberNode) && !(lastNode instanceof ScopeMemberNode_1.ScopeMemberNode) && !(lastNode instanceof ElementAttributeNode_1.ElementAttributeNode) && !(lastNode instanceof ElementStyleNode_1.ElementStyleNode)) {
            throw SyntaxError("Invalid assignment syntax near " + AST_1.Tree.toCode(tokens.splice(0, 10)));
        }
        tokens.splice(0, 1); // consume =
        var assignmentTokens = AST_1.Tree.getNextStatementTokens(tokens, false, false, true);
        return new ArithmeticAssignmentNode(lastNode, AST_1.Tree.processTokens(assignmentTokens), token.type);
    };
    return ArithmeticAssignmentNode;
}(Node_1.Node));
exports.ArithmeticAssignmentNode = ArithmeticAssignmentNode;
//# sourceMappingURL=ArithmeticAssignmentNode.js.map