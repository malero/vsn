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
//# sourceMappingURL=Tag.js.map