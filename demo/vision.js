(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute = /** @class */ (function () {
    function Attribute(tag) {
        this.tag = tag;
        this.configure();
    }
    Attribute.prototype.setup = function () { };
    ;
    Attribute.prototype.configure = function () { };
    ;
    return Attribute;
}());
exports.Attribute = Attribute;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tag_1 = require("./Tag");
var DOM = /** @class */ (function () {
    function DOM(document) {
        this.document = document;
        this.tags = [];
        this.tags.push(new Tag_1.Tag(Array.from(document.getElementsByTagName('body'))[0], this));
        this.buildFrom(document);
    }
    DOM.prototype.buildFrom = function (ele) {
        // Assign parents to each tag
        var allElements = [];
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            allElements.push(tag.element);
        }
        // Create tags for each html element with a v-attribute
        var newTags = [];
        for (var selector in Tag_1.Tag.attributeMap) {
            for (var _b = 0, _c = Array.from(ele.querySelectorAll("[" + selector + "]")); _b < _c.length; _b++) {
                var element = _c[_b];
                if (allElements.indexOf(element) > -1)
                    continue;
                var tag = new Tag_1.Tag(element, this);
                this.tags.push(tag);
                newTags.push(tag);
                allElements.push(element);
            }
        }
        for (var _d = 0, newTags_1 = newTags; _d < newTags_1.length; _d++) {
            var tag = newTags_1[_d];
            // Find closest ancestor
            var parentElement = tag.element.parentElement;
            while (parentElement) {
                if (allElements.indexOf(parentElement) > -1) {
                    tag.parent = this.getTagForElement(parentElement);
                    break;
                }
                parentElement = parentElement.parentElement;
            }
        }
        // Configure & setup attributes
        for (var _e = 0, newTags_2 = newTags; _e < newTags_2.length; _e++) {
            var tag = newTags_2[_e];
            tag.buildAttributes();
        }
        for (var _f = 0, newTags_3 = newTags; _f < newTags_3.length; _f++) {
            var tag = newTags_3[_f];
            tag.setupAttributes();
        }
    };
    DOM.prototype.getTagForElement = function (element) {
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            if (tag.element === element)
                return tag;
        }
        return null;
    };
    return DOM;
}());
exports.DOM = DOM;

},{"./Tag":4}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var simple_ts_models_1 = require("simple-ts-models");
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var ScopeReference = /** @class */ (function () {
    function ScopeReference(scope, key, value) {
        this.scope = scope;
        this.key = key;
        this.value = value;
    }
    return ScopeReference;
}());
exports.ScopeReference = ScopeReference;
var Scope = /** @class */ (function (_super) {
    __extends(Scope, _super);
    function Scope(parent) {
        var _this = _super.call(this) || this;
        if (parent)
            _this.parent = parent;
        _this.children = [];
        _this.data = new simple_ts_models_1.DataModel({});
        _this.keys = [];
        return _this;
    }
    Object.defineProperty(Scope.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (scope) {
            this._parent = scope;
            scope.addChild(this);
        },
        enumerable: true,
        configurable: true
    });
    Scope.prototype.addChild = function (scope) {
        this.children.push(scope);
    };
    Scope.prototype.getReference = function (path) {
        var scopePath = path.split('.');
        var key = scopePath[0];
        var scope = this;
        var val = null;
        var len = scopePath.length;
        for (var i = 0; i < len; i++) {
            key = scopePath[i];
            val = scope.get(key, i === 0);
            if ([null, undefined].indexOf(val) > -1 && i + 1 < len) {
                val = new Scope(scope);
                scope.set(key, val);
            }
            if (val && val instanceof Scope) {
                scope = val;
            }
        }
        return new ScopeReference(scope, key, val);
    };
    Scope.prototype.get = function (key, searchParents) {
        if (searchParents === void 0) { searchParents = true; }
        var value = this.data[key];
        if (value === undefined || value === null) {
            if (searchParents && this.parent)
                return this.parent.get(key, searchParents);
            return '';
        }
        return this.data[key];
    };
    Scope.prototype.set = function (key, value) {
        if (this.data[key] === undefined)
            this.data.createField(key);
        if (this.data[key] !== value) {
            this.data[key] = value;
            this.trigger("change:" + key, value);
            this.trigger('change', key, value);
        }
        if (this.keys.indexOf(key) === -1)
            this.keys.push(key);
    };
    Scope.prototype.clear = function () {
        for (var _i = 0, _a = this.keys; _i < _a.length; _i++) {
            var key = _a[_i];
            if (['function', 'object'].indexOf(typeof this.get(key)) > -1)
                continue;
            this.set(key, null);
        }
    };
    Scope.prototype.cleanup = function () {
        this.children.length = 0;
        this.parent = null;
    };
    Scope.prototype.wrap = function (wrapped) {
        var _this = this;
        if (this.wrapped !== undefined)
            throw Error("A scope can only wrap a single object");
        this.wrapped = wrapped;
        var _loop_1 = function (field) {
            var getter = function () {
                var val = _this.wrapped[field];
                if (typeof val === 'function')
                    val = val.bind(_this.data);
                return val;
            };
            var setter = function (value) {
                _this.wrapped[field] = value;
                _this.trigger("change:" + field, value);
                _this.trigger('change', field, value);
            };
            Object.defineProperty(this_1.data, field, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });
        };
        var this_1 = this;
        for (var field in wrapped) {
            _loop_1(field);
        }
    };
    return Scope;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Scope = Scope;

},{"simple-ts-event-dispatcher":13,"simple-ts-models":25}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Scope_1 = require("./Scope");
var Bind_1 = require("./attributes/Bind");
var Click_1 = require("./attributes/Click");
var Controller_1 = require("./attributes/Controller");
var List_1 = require("./attributes/List");
var ListItem_1 = require("./attributes/ListItem");
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var Name_1 = require("./attributes/Name");
var Tag = /** @class */ (function (_super) {
    __extends(Tag, _super);
    function Tag(element, dom) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.dom = dom;
        _this.inputTags = [
            'input',
            'select',
            'textarea'
        ];
        _this.scope = new Scope_1.Scope();
        _this.rawAttributes = {};
        _this.attributes = [];
        for (var i = 0; i < _this.element.attributes.length; i++) {
            var a = _this.element.attributes[i];
            if (a.name.substr(0, 2) == 'v-') {
                _this.rawAttributes[a.name] = a.value;
            }
        }
        return _this;
    }
    Object.defineProperty(Tag.prototype, "isInput", {
        get: function () {
            return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (tag) {
            this._parent = tag;
            this.scope.parent = tag.scope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tag.prototype, "scope", {
        get: function () {
            return this._scope;
        },
        set: function (scope) {
            this._scope = scope;
        },
        enumerable: true,
        configurable: true
    });
    Tag.prototype.wrapScope = function (cls) {
    };
    Tag.prototype.decompose = function () {
        this.element.remove();
    };
    Tag.prototype.getAttribute = function (key) {
        var cls = Tag.attributeMap[key];
        if (!cls)
            return;
        for (var _i = 0, _a = this.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            if (attr instanceof cls)
                return attr;
        }
    };
    Tag.prototype.buildAttributes = function () {
        this.attributes.length = 0;
        for (var attr in this.rawAttributes) {
            if (Tag.attributeMap[attr])
                this.attributes.push(new Tag.attributeMap[attr](this));
        }
    };
    Tag.prototype.setupAttributes = function () {
        for (var _i = 0, _a = this.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            attr.setup();
        }
    };
    Tag.attributeMap = {
        'v-name': Name_1.Name,
        'v-class': Controller_1.Controller,
        'v-list': List_1.List,
        'v-list-item': ListItem_1.ListItem,
        'v-bind': Bind_1.Bind,
        'v-click': Click_1.Click,
    };
    return Tag;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Tag = Tag;

},{"./Scope":3,"./attributes/Bind":7,"./attributes/Click":8,"./attributes/Controller":9,"./attributes/List":10,"./attributes/ListItem":11,"./attributes/Name":12,"simple-ts-event-dispatcher":13}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DOM_1 = require("./DOM");
var Vision = /** @class */ (function () {
    function Vision() {
        document.addEventListener("DOMContentLoaded", this.setup.bind(this));
    }
    Vision.prototype.setup = function () {
        this.dom = new DOM_1.DOM(document);
    };
    return Vision;
}());
exports.Vision = Vision;
exports.vision = new Vision();
window['vision'] = exports.vision;

},{"./DOM":2}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TokenType;
(function (TokenType) {
    TokenType[TokenType["WHITESPACE"] = 0] = "WHITESPACE";
    TokenType[TokenType["NAME"] = 1] = "NAME";
    TokenType[TokenType["L_BRACE"] = 2] = "L_BRACE";
    TokenType[TokenType["R_BRACE"] = 3] = "R_BRACE";
    TokenType[TokenType["L_BRACKET"] = 4] = "L_BRACKET";
    TokenType[TokenType["R_BRACKET"] = 5] = "R_BRACKET";
    TokenType[TokenType["L_PAREN"] = 6] = "L_PAREN";
    TokenType[TokenType["R_PAREN"] = 7] = "R_PAREN";
    TokenType[TokenType["PERIOD"] = 8] = "PERIOD";
    TokenType[TokenType["COMMA"] = 9] = "COMMA";
    TokenType[TokenType["COLON"] = 10] = "COLON";
    TokenType[TokenType["SEMI_COLON"] = 11] = "SEMI_COLON";
    TokenType[TokenType["STRING_LITERAL"] = 12] = "STRING_LITERAL";
    TokenType[TokenType["NUMBER_LITERAL"] = 13] = "NUMBER_LITERAL";
    TokenType[TokenType["BOOLEAN_LITERAL"] = 14] = "BOOLEAN_LITERAL";
    TokenType[TokenType["NULL_LITERAL"] = 15] = "NULL_LITERAL";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var TOKEN_PATTERNS = [
    {
        type: TokenType.WHITESPACE,
        pattern: /^\s+/
    },
    {
        type: TokenType.NAME,
        pattern: /^[_a-zA-Z][_a-zA-Z0-9]*/
    },
    {
        type: TokenType.L_BRACE,
        pattern: /^{/
    },
    {
        type: TokenType.R_BRACE,
        pattern: /^}/
    },
    {
        type: TokenType.L_BRACKET,
        pattern: /^\[/
    },
    {
        type: TokenType.R_BRACKET,
        pattern: /^]/
    },
    {
        type: TokenType.L_PAREN,
        pattern: /^\(/
    },
    {
        type: TokenType.R_PAREN,
        pattern: /^\)/
    },
    {
        type: TokenType.PERIOD,
        pattern: /^\./
    },
    {
        type: TokenType.COMMA,
        pattern: /^,/
    },
    {
        type: TokenType.COLON,
        pattern: /^:/
    },
    {
        type: TokenType.SEMI_COLON,
        pattern: /^;/
    },
    {
        type: TokenType.STRING_LITERAL,
        pattern: /^"([^"]*)"/
    },
    {
        type: TokenType.STRING_LITERAL,
        pattern: /^'([^']*)'/
    },
    {
        type: TokenType.NUMBER_LITERAL,
        pattern: /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?/i
    },
    {
        type: TokenType.BOOLEAN_LITERAL,
        pattern: /^true|false/
    },
    {
        type: TokenType.NULL_LITERAL,
        pattern: /^null/
    }
];
function tokenize(code) {
    var tokens = [];
    var foundToken;
    do {
        foundToken = false;
        for (var _i = 0, TOKEN_PATTERNS_1 = TOKEN_PATTERNS; _i < TOKEN_PATTERNS_1.length; _i++) {
            var tp = TOKEN_PATTERNS_1[_i];
            var match = tp.pattern.exec(code);
            if (match) {
                tokens.push({
                    type: tp.type,
                    value: match[match.length - 1]
                });
                code = code.substring(match[0].length);
                foundToken = true;
                break;
            }
        }
    } while (code.length > 0 && foundToken);
    return tokens;
}
exports.tokenize = tokenize;
var MemberExpressionNode = /** @class */ (function () {
    function MemberExpressionNode(obj, name) {
        this.obj = obj;
        this.name = name;
    }
    MemberExpressionNode.prototype.evaluate = function (scope) {
        return this.obj.evaluate(scope)[this.name.evaluate(scope)];
    };
    return MemberExpressionNode;
}());
var LiteralNode = /** @class */ (function () {
    function LiteralNode(value) {
        this.value = value;
    }
    LiteralNode.prototype.evaluate = function (scope) {
        return this.value;
    };
    return LiteralNode;
}());
var StringNode = /** @class */ (function () {
    function StringNode(node) {
        this.node = node;
    }
    StringNode.prototype.evaluate = function (scope) {
        return "" + this.node.evaluate(scope);
    };
    return StringNode;
}());
var FunctionCallNode = /** @class */ (function () {
    function FunctionCallNode(fnc, args) {
        this.fnc = fnc;
        this.args = args;
    }
    FunctionCallNode.prototype.evaluate = function (scope) {
        return this.fnc.evaluate(scope).apply(void 0, this.args.evaluate(scope));
    };
    return FunctionCallNode;
}());
var FunctionArgumentNode = /** @class */ (function () {
    function FunctionArgumentNode(args) {
        this.args = args;
    }
    FunctionArgumentNode.prototype.evaluate = function (scope) {
        var values = [];
        for (var _i = 0, _a = this.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            values.push(arg.evaluate(scope));
        }
        return values;
    };
    return FunctionArgumentNode;
}());
var ScopeMemberNode = /** @class */ (function () {
    function ScopeMemberNode(scope, name) {
        this.scope = scope;
        this.name = name;
    }
    ScopeMemberNode.prototype.evaluate = function (scope) {
        return this.scope.evaluate(scope).get(this.name.evaluate(scope));
    };
    return ScopeMemberNode;
}());
var RootScopeMemberNode = /** @class */ (function () {
    function RootScopeMemberNode(name) {
        this.name = name;
    }
    RootScopeMemberNode.prototype.evaluate = function (scope) {
        return scope.get(this.name.evaluate(scope));
    };
    return RootScopeMemberNode;
}());
var Tree = /** @class */ (function () {
    function Tree(code) {
        this.code = code;
        var tokens = tokenize(code);
        this.rootNode = Tree.processTokens(tokens);
    }
    Tree.prototype.evaluate = function (scope) {
        return this.rootNode.evaluate(scope);
    };
    Tree.processTokens = function (tokens) {
        var current = 0;
        var node = null;
        var count = 0;
        while (tokens.length > 0) {
            count++;
            if (count > 1000)
                break;
            var token = tokens[current];
            if (token.type === TokenType.NAME) {
                node = new RootScopeMemberNode(new LiteralNode(token.value));
                tokens.splice(0, 1);
            }
            else if ([TokenType.STRING_LITERAL, TokenType.NUMBER_LITERAL].indexOf(token.type) > -1) {
                node = new LiteralNode(token.value);
            }
            else if (token.type === TokenType.PERIOD && tokens[current + 1].type === TokenType.NAME) {
                node = new ScopeMemberNode(node, new LiteralNode(tokens[current + 1].value));
                tokens.splice(0, 2);
            }
            else if (tokens[0].type === TokenType.L_PAREN) {
                var funcArgs = Tree.getFunctionArgumentTokens(tokens);
                var nodes = [];
                for (var _i = 0, funcArgs_1 = funcArgs; _i < funcArgs_1.length; _i++) {
                    var arg = funcArgs_1[_i];
                    nodes.push(Tree.processTokens(arg));
                }
                node = new FunctionCallNode(node, new FunctionArgumentNode(nodes));
            }
        }
        return node;
    };
    Tree.getFunctionArgumentTokens = function (tokens) {
        var leftParens = 0;
        var argumentTokens = [];
        var tokenSet = [];
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token.type === TokenType.L_PAREN) {
                leftParens += 1;
                if (leftParens > 1)
                    tokenSet.push(token);
            }
            else if (token.type === TokenType.R_PAREN) {
                leftParens -= 1;
                if (leftParens > 0)
                    tokenSet.push(token);
            }
            else if (token.type === TokenType.COMMA && leftParens == 1) {
                argumentTokens.push(tokenSet);
                tokenSet = [];
            }
            else if (token.type === TokenType.WHITESPACE) {
            }
            else {
                tokenSet.push(token);
            }
            // Consume token
            tokens.splice(0, 1);
            i--;
            if (leftParens === 0) {
                argumentTokens.push(tokenSet);
                return argumentTokens;
            }
        }
        throw Error('Invalid Syntax, missing )');
    };
    return Tree;
}());
exports.Tree = Tree;

},{}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute_1 = require("../Attribute");
var Bind = /** @class */ (function (_super) {
    __extends(Bind, _super);
    function Bind() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Bind.prototype, "value", {
        get: function () {
            if (!this.boundScope)
                return null;
            return this.boundScope.get(this.key, false);
        },
        set: function (v) {
            if (this.boundScope) {
                this.boundScope.set(this.key, v);
            }
        },
        enumerable: true,
        configurable: true
    });
    Bind.prototype.setup = function () {
        var ref = this.tag.scope.getReference(this.tag.rawAttributes['v-bind']);
        this.key = ref.key;
        this.boundScope = ref.scope;
        this.boundScope.bind("change:" + this.key, this.updateTo, this);
        if (!this.value)
            this.updateFrom();
        else
            this.updateTo();
        if (this.tag.isInput)
            this.tag.element.onkeyup = this.updateFrom.bind(this);
    };
    Bind.prototype.updateFrom = function () {
        if (this.tag.isInput) {
            this.value = this.tag.element.value;
        }
        else {
            this.value = this.tag.element.innerText;
        }
    };
    Bind.prototype.updateTo = function () {
        if (this.tag.isInput) {
            this.tag.element.value = this.value;
        }
        else {
            this.tag.element.innerText = this.value;
        }
    };
    return Bind;
}(Attribute_1.Attribute));
exports.Bind = Bind;

},{"../Attribute":1}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute_1 = require("../Attribute");
var ast_1 = require("../ast");
var Click = /** @class */ (function (_super) {
    __extends(Click, _super);
    function Click() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Click.prototype.setup = function () {
        var click = this.tag.rawAttributes['v-click'];
        this.clickHandler = new ast_1.Tree(click);
        this.tag.element.onclick = this.onClick.bind(this);
    };
    Click.prototype.onClick = function () {
        this.clickHandler.evaluate(this.tag.scope);
    };
    return Click;
}(Attribute_1.Attribute));
exports.Click = Click;

},{"../Attribute":1,"../ast":6}],9:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute_1 = require("../Attribute");
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Controller.prototype.setup = function () {
        var parentScope = this.tag.parent.scope;
        if (!parentScope)
            return;
        var controllerClassName = this.tag.rawAttributes['v-class'];
        var cls = window[controllerClassName];
        this.tag.scope.wrap(new cls());
    };
    return Controller;
}(Attribute_1.Attribute));
exports.Controller = Controller;

},{"../Attribute":1}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute_1 = require("../Attribute");
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    List.prototype.setup = function () {
        this.items = [];
        if (this.tag.element.children.length > 0) {
            this.template = this.tag.element.children[0].cloneNode(true);
        }
        for (var _i = 0, _a = Array.from(this.tag.element.querySelectorAll('[v-list-item]')); _i < _a.length; _i++) {
            var element = _a[_i];
            var tag = this.tag.dom.getTagForElement(element);
            if (tag)
                this.items.push(tag);
        }
        this.tag.scope.set('add', this.add.bind(this));
        this.tag.scope.set('remove', this.remove.bind(this));
    };
    Object.defineProperty(List.prototype, "listItemName", {
        get: function () {
            return this.tag.rawAttributes['v-list-item-name'] || 'item';
        },
        enumerable: true,
        configurable: true
    });
    List.prototype.remove = function (item) {
        for (var i = 0; i < this.items.length; i++) {
            var tag = this.items[i];
            if (tag.scope.get(this.listItemName) == item) {
                tag.decompose();
                this.items.splice(i, 1);
                return;
            }
        }
    };
    List.prototype.add = function () {
        var element = this.template.cloneNode(true);
        this.tag.element.appendChild(element);
        this.tag.dom.buildFrom(this.tag.element);
        var tag = this.tag.dom.getTagForElement(element);
        this.items.push(tag);
        var item = tag.scope.get(this.listItemName);
        item.clear();
    };
    return List;
}(Attribute_1.Attribute));
exports.List = List;

},{"../Attribute":1}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute_1 = require("../Attribute");
var ListItem = /** @class */ (function (_super) {
    __extends(ListItem, _super);
    function ListItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListItem.prototype.setup = function () {
        var parent = this.tag.parent;
        var list = parent.getAttribute('v-list');
        this.tag.scope.set(list.listItemName, this.tag.scope);
    };
    ListItem.prototype.configure = function () {
    };
    return ListItem;
}(Attribute_1.Attribute));
exports.ListItem = ListItem;

},{"../Attribute":1}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute_1 = require("../Attribute");
var Name = /** @class */ (function (_super) {
    __extends(Name, _super);
    function Name() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Name.prototype.setup = function () {
        var parentScope = this.tag.scope.parent;
        if (parentScope)
            parentScope.set(this.tag.rawAttributes['v-name'], this.tag.scope);
    };
    return Name;
}(Attribute_1.Attribute));
exports.Name = Name;

},{"../Attribute":1}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventCallback = /** @class */ (function () {
    function EventCallback(fnc, key, once, context) {
        this.fnc = fnc;
        this.key = key;
        this.once = once;
        this.context = context;
        this.calls = 0;
    }
    EventCallback.prototype.call = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.once && this.calls > 0)
            return false;
        (_a = this.fnc).apply.apply(_a, [this.context].concat(args));
        this.calls += 1;
        return true;
        var _a;
    };
    return EventCallback;
}());
exports.EventCallback = EventCallback;
var EventDispatcher = /** @class */ (function () {
    function EventDispatcher() {
        this._lastKey = 0;
        this._listeners = {};
    }
    EventDispatcher.prototype.bind = function (event, fct, context, once) {
        once = once || false;
        this._lastKey++;
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(new EventCallback(fct, this._lastKey, once, context));
        return this._lastKey;
    };
    EventDispatcher.prototype.once = function (event, fct, context) {
        return this.bind(event, fct, context, true);
    };
    EventDispatcher.prototype.unbind = function (event, key) {
        if (event in this._listeners === false)
            return false;
        if (key) {
            for (var _i = 0, _a = this._listeners[event]; _i < _a.length; _i++) {
                var cb = _a[_i];
                if (key == cb.key) {
                    this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
                    return true;
                }
            }
        }
        else {
            this._listeners[event] = [];
            return true;
        }
        return false;
    };
    EventDispatcher.prototype.unbindWithContext = function (event, context) {
        if (event in this._listeners === false)
            return 0;
        var toRemove = [], cnt = 0;
        for (var _i = 0, _a = this._listeners[event]; _i < _a.length; _i++) {
            var cb = _a[_i];
            if (context == cb.context) {
                toRemove.push(cb);
            }
        }
        for (var _b = 0, toRemove_1 = toRemove; _b < toRemove_1.length; _b++) {
            var cb = toRemove_1[_b];
            this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
            cnt++;
        }
        return cnt;
    };
    EventDispatcher.prototype.getListener = function (event, key) {
        for (var _i = 0, _a = this._listeners[event]; _i < _a.length; _i++) {
            var cb = _a[_i];
            if (key == cb.key)
                return cb;
        }
    };
    EventDispatcher.prototype.trigger = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (event in this._listeners === false)
            return;
        for (var i = 0; i < this._listeners[event].length; i++) {
            var cb = this._listeners[event][i];
            // We need to unbind callbacks before they're called to prevent
            // infinite loops if the event is somehow triggered within the
            // callback
            if (cb.once) {
                this.unbind(event, cb.key);
                i--;
            }
            cb.call(args);
        }
    };
    return EventDispatcher;
}());
exports.EventDispatcher = EventDispatcher;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageList = /** @class */ (function () {
    function MessageList(messages) {
        this.reset();
        if (messages)
            this.merge(messages);
    }
    MessageList.prototype.reset = function () {
        // Reset the object
        var keys = this.keys;
        this._cachedList = undefined;
        if (keys.length > 0) {
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var field = keys_1[_i];
                delete this[field];
            }
        }
    };
    MessageList.prototype.add = function (field, errors, replace) {
        if (replace === void 0) { replace = false; }
        this.merge((_a = {},
            _a[field] = typeof errors == 'string' ? [errors] : errors,
            _a), replace);
        var _a;
    };
    MessageList.prototype.merge = function (messages, replace) {
        var _this = this;
        if (replace === void 0) { replace = false; }
        if (!messages)
            return;
        this._cachedList = undefined;
        var keys = this.keys;
        var _loop_1 = function (field) {
            if (messages[field] instanceof Array) {
                if (!replace && keys.indexOf(field) > -1) {
                    messages[field].map(function (x) { _this[field].push(x); });
                }
                else if (messages[field].length > 0) {
                    this_1[field] = messages[field];
                }
            }
        };
        var this_1 = this;
        for (var field in messages) {
            _loop_1(field);
        }
    };
    Object.defineProperty(MessageList.prototype, "list", {
        get: function () {
            if (this._cachedList)
                return this._cachedList;
            var list = {}, keys = this.keys;
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var field = keys_2[_i];
                list[field] = this[field];
            }
            this._cachedList = list;
            return list;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MessageList.prototype, "keys", {
        get: function () {
            var keys = Object.keys(this);
            keys.splice(keys.indexOf('_cachedList'), 1);
            return keys;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MessageList.prototype, "length", {
        get: function () {
            return this.keys.length;
        },
        enumerable: true,
        configurable: true
    });
    return MessageList;
}());
exports.default = MessageList;

},{}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Collection = /** @class */ (function (_super) {
    __extends(Collection, _super);
    function Collection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getData = function () {
            // Returns an array of data from all of the models in the collection
            var data = [];
            for (var _i = 0, _a = _this; _i < _a.length; _i++) {
                var item = _a[_i];
                data.push(item.getData());
            }
            return data;
        };
        return _this;
    }
    return Collection;
}(Array));
exports.Collection = Collection;

},{}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ModelAbstract_1 = require("./ModelAbstract");
var DataModel = /** @class */ (function (_super) {
    __extends(DataModel, _super);
    function DataModel(data) {
        var _this = _super.call(this) || this;
        if (data instanceof Array) {
            _this.__fields__ = data;
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var field = data_1[_i];
                _this.createField(field);
            }
        }
        else {
            _this.setData(data);
        }
        return _this;
    }
    DataModel.prototype.setData = function (data) {
        for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
            var field = _a[_i];
            if (this.__fields__.indexOf(field) == -1) {
                this.__fields__.push(field);
                this.createField(field);
            }
        }
        _super.prototype.setData.call(this, data);
    };
    DataModel.prototype.bind = function (event, fct, context, once) {
        if (event.indexOf('change:') == 0)
            this.createField(event.substr(7));
        return _super.prototype.bind.call(this, event, fct, context, once);
    };
    return DataModel;
}(ModelAbstract_1.ModelAbstract));
exports.DataModel = DataModel;

},{"./ModelAbstract":18}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var simple_ts_message_list_1 = require("simple-ts-message-list");
var ModelAbstract_1 = require("./ModelAbstract");
var Model = /** @class */ (function (_super) {
    __extends(Model, _super);
    function Model(data) {
        var _this = _super.call(this) || this;
        var fields = _this.__fields__.splice(0, _this.__fields__.length);
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            (function (_self, field) {
                if (!_self['__' + field + '__'])
                    return;
                _self.__fields__.push(field);
                var _field = _self['__' + field + '__'], fieldType = _field[0], config = _field[1] || {};
                _self.createField(field, fieldType, config);
            })(_this, field);
        }
        _this._hasErrors = false;
        _this.setData(data);
        _this._lastData = _this.getData();
        _this._constructor();
        return _this;
    }
    Model.prototype._constructor = function () { };
    Model.prototype.validate = function () {
        this._hasErrors = false;
        this._errors = new simple_ts_message_list_1.default;
        for (var _i = 0, _a = this.getFields(); _i < _a.length; _i++) {
            var field = _a[_i];
            var errors = this['__' + field].validate();
            if (errors.length > 0) {
                this._errors.add(field, errors, true);
                this._hasErrors = true;
            }
        }
        return this._errors;
    };
    Model.prototype.hasErrors = function () {
        this.validate();
        return this._hasErrors;
    };
    Object.defineProperty(Model.prototype, "errors", {
        get: function () {
            return this._errors;
        },
        enumerable: true,
        configurable: true
    });
    return Model;
}(ModelAbstract_1.ModelAbstract));
exports.Model = Model;

},{"./ModelAbstract":18,"simple-ts-message-list":14}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var Field_1 = require("./fields/Field");
var ModelAbstract = /** @class */ (function (_super) {
    __extends(ModelAbstract, _super);
    function ModelAbstract() {
        var _this = _super.call(this) || this;
        // Models may have __fields__ from prototype
        if (!_this.__fields__)
            _this.__fields__ = [];
        return _this;
    }
    ModelAbstract.prototype.createField = function (field, fieldType, config) {
        var _this = this;
        if (fieldType === void 0) { fieldType = Field_1.Field; }
        config = config || {};
        var instance = new fieldType(this, config.default, config), propDesc = Object.getOwnPropertyDescriptor(this, field);
        this['__' + field] = instance;
        // property getter
        var fieldGetter = function () {
            return instance.value;
        };
        var getter = propDesc ? propDesc.get : fieldGetter, fieldSetter = function (newVal) {
            instance.value = newVal;
        }, setter = propDesc ? propDesc.set : fieldSetter;
        // Delete the original property
        delete this[field];
        // Create new property with getter and setter
        Object.defineProperty(this, field, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
        instance.bind('change', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this.trigger.apply(_this, ['change', field].concat(args));
            _this.trigger.apply(_this, ['change:' + field].concat(args));
        });
        return instance;
    };
    ModelAbstract.prototype.setData = function (data) {
        var fields = this.getFields();
        for (var key in data) {
            if (fields.indexOf(key) > -1) {
                this[key] = data[key];
            }
        }
    };
    ModelAbstract.prototype.getData = function () {
        var data = {};
        for (var _i = 0, _a = this.getFields(); _i < _a.length; _i++) {
            var key = _a[_i];
            var field = this['__' + key];
            if (this[key] == null || !field)
                continue;
            data[key] = field.getData();
        }
        return data;
    };
    ModelAbstract.prototype.getFields = function () {
        return this.__fields__;
    };
    ModelAbstract.prototype.getField = function (field) {
        return this['__' + field];
    };
    ModelAbstract.prototype.bindToFields = function (event, fields, callback) {
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            var _field = this['__' + field];
            if (_field)
                _field.bind(event, callback);
        }
    };
    ModelAbstract.prototype.setLastData = function () {
        this._lastData = this.getData();
    };
    /*
     * Revert data to the last setData() call. Useful for forms that edit a
     * list of items and then hit cancel rather than saving the list.
     */
    ModelAbstract.prototype.revert = function () {
        this.setData(this._lastData);
    };
    ModelAbstract.prototype.isModified = function () {
        var oData = this._lastData, nData = this.getData();
        for (var _i = 0, _a = this.getFields(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (nData[key] != oData[key])
                return true;
        }
        return false;
    };
    return ModelAbstract;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.ModelAbstract = ModelAbstract;

},{"./fields/Field":21,"simple-ts-event-dispatcher":13}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Field_1 = require("./Field");
var BooleanField = /** @class */ (function (_super) {
    __extends(BooleanField, _super);
    function BooleanField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(BooleanField.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (data) {
            var oldValue = this.value;
            this._value = !!data;
            this.trigger('change', {
                oldValue: oldValue,
                value: data
            });
        },
        enumerable: true,
        configurable: true
    });
    return BooleanField;
}(Field_1.Field));
exports.BooleanField = BooleanField;

},{"./Field":21}],20:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Field_1 = require("./Field");
var EmailField = /** @class */ (function (_super) {
    __extends(EmailField, _super);
    function EmailField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return _this;
    }
    EmailField.prototype.validate = function () {
        _super.prototype.validate.call(this);
        if (this._value != null && !this._emailRegex.test(this._value))
            this._errors.push('Please enter a valid email address');
        return this._errors;
    };
    return EmailField;
}(Field_1.Field));
exports.EmailField = EmailField;

},{"./Field":21}],21:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
function field(fieldType, config) {
    if (fieldType === void 0) { fieldType = Field; }
    if (config === void 0) { config = {}; }
    return function (target, key) {
        if (target.__fields__ == undefined) {
            target.__fields__ = [];
        }
        // Abstract models share __fields__
        if (target.__fields__.indexOf(key) == -1)
            target.__fields__.push(key);
        var getter = function () {
            return [fieldType, config];
        };
        Object.defineProperty(target, '__' + key + '__', {
            get: getter,
            set: function (v) { },
            enumerable: false,
            configurable: true
        });
    };
}
exports.field = field;
var Field = /** @class */ (function (_super) {
    __extends(Field, _super);
    function Field(model, value, config) {
        var _this = _super.call(this) || this;
        _this.model = model;
        _this.config = config;
        _this.value = value;
        _this._errors = [];
        return _this;
    }
    Object.defineProperty(Field.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (v) {
            var oldValue = this._value;
            this._value = v;
            this.trigger('change', {
                oldValue: oldValue,
                value: v
            });
        },
        enumerable: true,
        configurable: true
    });
    Field.prototype.getData = function () {
        return this.value;
    };
    Field.prototype.validate = function () {
        this._errors = [];
        if (this.config['required'] == true && this._value == null)
            this._errors.push('This field is required.');
        return this._errors;
    };
    return Field;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Field = Field;

},{"simple-ts-event-dispatcher":13}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Field_1 = require("./Field");
var FloatField = /** @class */ (function (_super) {
    __extends(FloatField, _super);
    function FloatField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FloatField.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (data) {
            var oldValue = this.value;
            if (typeof (data) == 'string')
                data = parseFloat(data);
            if (typeof (data) == "number" && this.config.toFixed)
                data = parseFloat(data.toFixed(this.config.toFixed));
            this._value = data;
            this.trigger('change', {
                oldValue: oldValue,
                value: data
            });
        },
        enumerable: true,
        configurable: true
    });
    return FloatField;
}(Field_1.Field));
exports.FloatField = FloatField;

},{"./Field":21}],23:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Field_1 = require("./Field");
var PositiveIntegerField = /** @class */ (function (_super) {
    __extends(PositiveIntegerField, _super);
    function PositiveIntegerField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(PositiveIntegerField.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (data) {
            var oldValue = this.value;
            if (data == null) {
                this._value = null;
                return;
            }
            else if (typeof (data) == 'string')
                data = parseInt(data);
            if (data <= 0)
                data = 0;
            this._value = data;
            this.trigger('change', {
                oldValue: oldValue,
                value: data
            });
        },
        enumerable: true,
        configurable: true
    });
    return PositiveIntegerField;
}(Field_1.Field));
exports.PositiveIntegerField = PositiveIntegerField;

},{"./Field":21}],24:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Field_1 = require("./Field");
var StringField = /** @class */ (function (_super) {
    __extends(StringField, _super);
    function StringField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(StringField.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (data) {
            var oldValue = this.value;
            this._value = '' + data;
            this.trigger('change', {
                oldValue: oldValue,
                value: data
            });
        },
        enumerable: true,
        configurable: true
    });
    return StringField;
}(Field_1.Field));
exports.StringField = StringField;

},{"./Field":21}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Field_1 = require("./fields/Field");
exports.field = Field_1.field;
var BooleanField_1 = require("./fields/BooleanField");
var EmailField_1 = require("./fields/EmailField");
var FloatField_1 = require("./fields/FloatField");
var PositiveNumberField_1 = require("./fields/PositiveNumberField");
var StringField_1 = require("./fields/StringField");
var DataModel_1 = require("./DataModel");
exports.DataModel = DataModel_1.DataModel;
var Model_1 = require("./Model");
exports.Model = Model_1.Model;
var Collection_1 = require("./Collection");
exports.Collection = Collection_1.Collection;
var fields = {
    Field: Field_1.Field,
    BooleanField: BooleanField_1.BooleanField,
    EmailField: EmailField_1.EmailField,
    FloatField: FloatField_1.FloatField,
    PositiveIntegerField: PositiveNumberField_1.PositiveIntegerField,
    StringField: StringField_1.StringField
};
exports.fields = fields;

},{"./Collection":15,"./DataModel":16,"./Model":17,"./fields/BooleanField":19,"./fields/EmailField":20,"./fields/Field":21,"./fields/FloatField":22,"./fields/PositiveNumberField":23,"./fields/StringField":24}]},{},[5]);
