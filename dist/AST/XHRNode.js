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
exports.XHRNode = void 0;
var Node_1 = require("./Node");
var AST_1 = require("../AST");
var Scope_1 = require("../Scope");
var ScopeDataAbstract_1 = require("../Scope/ScopeDataAbstract");
var XHRNode = /** @class */ (function (_super) {
    __extends(XHRNode, _super);
    function XHRNode(left, requestType, url) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.requestType = requestType;
        _this.url = url;
        return _this;
    }
    XHRNode.prototype.getChildNodes = function () {
        var nodes = [this.url];
        if (this.left)
            nodes.push(this.left);
        return nodes;
    };
    XHRNode.prototype.evaluate = function (scope, dom, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var url, method, data, _a, request, response, contentType;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.url.evaluate(scope, dom, tag)];
                    case 1:
                        url = _b.sent();
                        if (!this.left) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.left.evaluate(scope, dom, tag)];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = {};
                        _b.label = 4;
                    case 4:
                        data = _a;
                        if (data instanceof Scope_1.Scope)
                            data = data.data;
                        if (data instanceof ScopeDataAbstract_1.ScopeDataAbstract)
                            data = data.getData();
                        switch (this.requestType) {
                            case AST_1.TokenType.XHR_POST:
                                method = "POST";
                                break;
                            case AST_1.TokenType.XHR_PUT:
                                method = "PUT";
                                break;
                            case AST_1.TokenType.XHR_DELETE:
                                method = "DELETE";
                                break;
                            default:
                                method = "GET";
                        }
                        request = {
                            method: method
                        };
                        if (request.method === 'GET') {
                        }
                        else {
                            request['body'] = (typeof data === "string") ? data : JSON.stringify(data);
                        }
                        return [4 /*yield*/, fetch(url, request)];
                    case 5:
                        response = _b.sent();
                        contentType = response.headers.get('content-type');
                        if (!(contentType && contentType.includes('application/json'))) return [3 /*break*/, 7];
                        return [4 /*yield*/, response.json()];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, response.text()];
                    case 8: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    XHRNode.parse = function (node, token, tokens) {
        tokens.splice(0, 1); // Consume request type
        var url = AST_1.Tree.processTokens(AST_1.Tree.getNextStatementTokens(tokens, false, false, false));
        return new XHRNode(node, token.type, url);
    };
    XHRNode.match = function (tokens) {
        return [
            AST_1.TokenType.XHR_POST,
            AST_1.TokenType.XHR_PUT,
            AST_1.TokenType.XHR_GET,
            AST_1.TokenType.XHR_DELETE,
        ].indexOf(tokens[0].type) > -1;
    };
    return XHRNode;
}(Node_1.Node));
exports.XHRNode = XHRNode;
//# sourceMappingURL=XHRNode.js.map