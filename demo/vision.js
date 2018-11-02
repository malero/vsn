(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        _this.parent = parent;
        _this.data = new simple_ts_models_1.DataModel({});
        return _this;
    }
    Scope.prototype.getReference = function (path) {
        var scopePath = path.split('.');
        var key = scopePath[0];
        var scope = this;
        var val = null;
        var len = scopePath.length;
        for (var i = 0; i < len; i++) {
            key = scopePath[i];
            val = scope.get(key);
            if (val === undefined && i + 1 < len) {
                val = new Scope(scope);
                scope.set(key, val);
            }
            if (val && typeof val.get === 'function') {
                scope = val;
            }
        }
        return new ScopeReference(scope, key, val);
    };
    Scope.prototype.get = function (key) {
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
    };
    return Scope;
}(simple_ts_event_dispatcher_1.EventDispatcher));
exports.Scope = Scope;
var Wrapper = /** @class */ (function (_super) {
    __extends(Wrapper, _super);
    function Wrapper(wrapped, // Instantiated object from v-controller attribute,
    parent) {
        var _this = _super.call(this, parent) || this;
        _this.wrapped = wrapped;
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
        return _this;
    }
    return Wrapper;
}(Scope));
exports.Wrapper = Wrapper;

},{"simple-ts-event-dispatcher":8,"simple-ts-models":20}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tag = /** @class */ (function () {
    function Tag(element, scope) {
        this.element = element;
        this.scope = scope;
        this.inputTags = [
            'input',
            'select',
            'textarea'
        ];
        this.parseAttributes();
        this.setup();
    }
    Tag.prototype.parseAttributes = function () {
        this.attributes = {};
        for (var i = 0; i < this.element.attributes.length; i++) {
            var a = this.element.attributes[i];
            if (a.name.substr(0, 2) == 'v-') {
                this.attributes[a.name] = a.value;
            }
        }
    };
    Object.defineProperty(Tag.prototype, "isInput", {
        get: function () {
            return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
        },
        enumerable: true,
        configurable: true
    });
    return Tag;
}());
exports.Tag = Tag;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Controller_1 = require("./tags/Controller");
var Binding_1 = require("./tags/Binding");
var Click_1 = require("./tags/Click");
var VOM = /** @class */ (function () {
    function VOM($document, scope) {
        this.$document = $document;
        this.scope = scope;
        this.tags = [];
        for (var selector in VOM.tagMap) {
            for (var _i = 0, _a = Array.from($document.querySelectorAll(selector)); _i < _a.length; _i++) {
                var element = _a[_i];
                this.tags.push(new VOM.tagMap[selector](element, scope));
            }
        }
    }
    VOM.tagMap = {
        '[v-controller]': Controller_1.Controller,
        '[v-bind]': Binding_1.Binding,
        '[v-click]': Click_1.Click
    };
    return VOM;
}());
exports.VOM = VOM;

},{"./tags/Binding":5,"./tags/Click":6,"./tags/Controller":7}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VOM_1 = require("./VOM");
var Scope_1 = require("./Scope");
var Vision = /** @class */ (function () {
    function Vision() {
        this.scope = new Scope_1.Scope();
        console.log('vision', this.scope);
        document.addEventListener("DOMContentLoaded", this.setup.bind(this));
    }
    Vision.prototype.setup = function () {
        console.log('document ready', this.scope);
        this.vom = new VOM_1.VOM(document, this.scope);
    };
    return Vision;
}());
exports.Vision = Vision;
exports.vision = new Vision();

},{"./Scope":1,"./VOM":3}],5:[function(require,module,exports){
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
var Tag_1 = require("../Tag");
var Binding = /** @class */ (function (_super) {
    __extends(Binding, _super);
    function Binding() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Binding.prototype, "value", {
        get: function () {
            if (!this.boundScope)
                return null;
            return this.boundScope.get(this.key);
        },
        set: function (v) {
            if (this.boundScope) {
                this.boundScope.set(this.key, v);
            }
        },
        enumerable: true,
        configurable: true
    });
    Binding.prototype.setup = function () {
        var ref = this.scope.getReference(this.attributes['v-bind']);
        this.key = ref.key;
        this.boundScope = ref.scope;
        this.boundScope.bind("change:" + this.key, this.updateTo, this);
        if (!this.value)
            this.updateFrom();
        else
            this.updateTo();
        if (this.isInput)
            this.element.onkeyup = this.updateFrom.bind(this);
    };
    Binding.prototype.updateFrom = function () {
        if (this.isInput) {
            this.value = this.element.value;
        }
        else {
            this.value = this.element.innerText;
        }
    };
    Binding.prototype.updateTo = function () {
        if (this.isInput) {
            this.element.value = this.value;
        }
        else {
            this.element.innerText = this.value;
        }
    };
    return Binding;
}(Tag_1.Tag));
exports.Binding = Binding;

},{"../Tag":2}],6:[function(require,module,exports){
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
var Tag_1 = require("../Tag");
var Click = /** @class */ (function (_super) {
    __extends(Click, _super);
    function Click() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Click.prototype.setup = function () {
        var click = this.attributes['v-click'];
        var ref = this.scope.getReference(click);
        this.onClickHandler = ref.value;
        this.element.onclick = this.onClick.bind(this);
    };
    Click.prototype.onClick = function () {
        if (this.onClickHandler)
            this.onClickHandler();
    };
    return Click;
}(Tag_1.Tag));
exports.Click = Click;

},{"../Tag":2}],7:[function(require,module,exports){
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
var Tag_1 = require("../Tag");
var Scope_1 = require("../Scope");
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Controller.prototype.setup = function () {
        var name = this.attributes['v-name'];
        var value = this.scope.get(name);
        var controllerClassName = this.attributes['v-controller'];
        var cls = window[controllerClassName];
        if (name && !value && cls) {
            this.controllerScope = new Scope_1.Wrapper(new cls(), this.scope);
            this.scope.set(name, this.controllerScope);
        }
        else if (value instanceof Scope_1.Wrapper) {
            this.controllerScope = value;
        }
    };
    return Controller;
}(Tag_1.Tag));
exports.Controller = Controller;

},{"../Scope":1,"../Tag":2}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./ModelAbstract":13}],12:[function(require,module,exports){
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

},{"./ModelAbstract":13,"simple-ts-message-list":9}],13:[function(require,module,exports){
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

},{"./fields/Field":16,"simple-ts-event-dispatcher":8}],14:[function(require,module,exports){
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

},{"./Field":16}],15:[function(require,module,exports){
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

},{"./Field":16}],16:[function(require,module,exports){
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

},{"simple-ts-event-dispatcher":8}],17:[function(require,module,exports){
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

},{"./Field":16}],18:[function(require,module,exports){
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

},{"./Field":16}],19:[function(require,module,exports){
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

},{"./Field":16}],20:[function(require,module,exports){
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

},{"./Collection":10,"./DataModel":11,"./Model":12,"./fields/BooleanField":14,"./fields/EmailField":15,"./fields/Field":16,"./fields/FloatField":17,"./fields/PositiveNumberField":18,"./fields/StringField":19}]},{},[4]);
