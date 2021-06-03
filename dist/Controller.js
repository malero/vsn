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
exports.Controller = void 0;
var simple_ts_event_dispatcher_1 = require("simple-ts-event-dispatcher");
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super.call(this) || this;
    }
    Object.defineProperty(Controller.prototype, "tag", {
        get: function () {
            return this._tag;
        },
        set: function (tag) {
            this._tag = tag;
            this.trigger('tag', tag);
        },
        enumerable: false,
        configurable: true
    });
    return Controller;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map