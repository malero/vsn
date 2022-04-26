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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagList = void 0;
var VisionHelper_1 = require("../helpers/VisionHelper");
var TagList = /** @class */ (function (_super) {
    __extends(TagList, _super);
    function TagList() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var _this = _super.apply(this, items) || this;
        Object.setPrototypeOf(_this, TagList.prototype);
        return _this;
    }
    Object.defineProperty(TagList.prototype, "scope", {
        get: function () {
            return this[0].scope;
        },
        enumerable: false,
        configurable: true
    });
    TagList.prototype.on = function (event, cbOrSelector, cb) {
        if (typeof cbOrSelector === "function") {
            this.forEach(function (e) { return e.element.addEventListener(event, cbOrSelector); });
        }
        else {
            this.forEach(function (elem) {
                elem.element.addEventListener(event, function (e) {
                    if (e.target.matches(cbOrSelector))
                        cb(e);
                });
            });
        }
        return this;
    };
    Object.defineProperty(TagList.prototype, "elements", {
        get: function () {
            return this.map(function (e) { return e.element; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TagList.prototype, "first", {
        get: function () {
            return this[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TagList.prototype, "last", {
        get: function () {
            return this[this.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    TagList.prototype.removeClass = function (className) {
        this.forEach(function (e) { return e.element.classList.remove(className); });
        return this;
    };
    TagList.prototype.addClass = function (className) {
        this.forEach(function (e) { return e.element.classList.add(className); });
        return this;
    };
    TagList.prototype.css = function (property, value) {
        var camelProp = property.replace(/(-[a-z])/, function (g) {
            return g.replace("-", "").toUpperCase();
        });
        this.forEach(function (e) { return (e.element.style[camelProp] = value); });
        return this;
    };
    return TagList;
}(Array));
exports.TagList = TagList;
if (VisionHelper_1.VisionHelper.inDevelopment && VisionHelper_1.VisionHelper.window)
    window['TagList'] = TagList;
//# sourceMappingURL=List.js.map