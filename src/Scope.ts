import {DataModel} from "simple-ts-models";
import {EventCallback, EventCallbackList, EventDispatcher, EventDispatcherCallback} from "simple-ts-event-dispatcher";

export class ScopeReference {
    constructor(
        public readonly scope: Scope,
        public readonly key: string,
        public readonly value: any
    ) {}
}

export enum ScopeVariableType {
    String,
    Integer,
    Float,
    Boolean
}

export class WrappedArray<T> extends Array<T> {
    private _listeners: EventCallbackList;
    private _lastKey: number;
    public readonly $wrapped: boolean = true;

    constructor(...items: T[]) {
        super(...items);
        Object.setPrototypeOf(this, WrappedArray.prototype);
        this._lastKey = 0;
        this._listeners = {};
    }

    push(...items: T[]): number {
        const num: number = super.push(...items);

        this.trigger('push', ...items);
        for (const item of items) {
            this.trigger('add', item);
        }
        return num;
    }

    splice(start: number, deleteCount?: number): T[] {
        const removed: T[] = super.splice(start, deleteCount);

        for (const item of removed) {
            this.trigger('remove', item);
        }

        return removed;
    }

    get length(): number {
        let c: number = 0;
        for (const item of this) {
            c += 1;
        }
        return c;
    }

    set length(num: number) {
        let c: number = 0;
        const toRemove: T[] = [];
        for (const item of this) {
            c += 1;
            if (c >= num) {
                toRemove.push(item);
            }
        }

        for (const item of toRemove) {
            this.splice(this.indexOf(item), 1);
            this.trigger('remove', item);
        }
    }

    bind(event: string, fct: EventDispatcherCallback, context?: any, once?: boolean): number {
        once = once || false;
        this._lastKey++;
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(new EventCallback(fct, this._lastKey, once, context));
        return this._lastKey;
    }

    once(event: string, fct: EventDispatcherCallback, context?: any): number {
        return this.bind(event, fct, context, true);
    }

    unbind(event: string, key?: number): boolean {
        if(!(event in this._listeners)) return false;
        if(key) {
            for(const cb of this._listeners[event]) {
                if(key == cb.key) {
                    this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
                    return true;
                }
            }
        } else {
            this._listeners[event] = [];
            return true;
        }
        return false;
    }

    unbindWithContext(event: string, context: any): number {
        if(!(event in this._listeners)) return 0;
        let toRemove: EventCallback[] = [],
            cnt = 0;

        for(const cb of this._listeners[event]) {
            if(context == cb.context) {
                toRemove.push(cb);
            }
        }

        for(const cb of toRemove) {
            this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
            cnt++;
        }
        return cnt;
    }

    getListener(event: string, key: number): EventCallback | undefined {
        for(const cb of this._listeners[event]) {
            if(key == cb.key)
                return cb;
        }
    }

    trigger(event: string, ...args: any[]): void {
        if(!(event in this._listeners)) return;

        for(let i = 0; i < this._listeners[event].length; i++) {
            const cb: EventCallback = this._listeners[event][i];

            // We need to unbind callbacks before they're called to prevent
            // infinite loops if the event is somehow triggered within the
            // callback
            if(cb.once) {
                this.unbind(event, cb.key);
                i--;
            }

            cb.call(args);
        }
    }
}


export class Scope extends EventDispatcher {
    public wrapped: any;
    protected data: DataModel;
    protected types: {[key: string]: ScopeVariableType;} = {};
    protected children: Scope[];
    protected keys: string[];
    protected _parentScope: Scope;

    constructor(
        parent?: Scope
    ) {
        super();
        if (parent)
            this.parentScope = parent;
        this.children = [];
        this.data = new DataModel({});
        this.keys = [];
    }

    public get parentScope(): Scope {
        return this._parentScope;
    }

    public set parentScope(scope: Scope) {
        this._parentScope = scope;
        scope.addChild(this);
    }

    public addChild(scope: Scope) {
        this.children.push(scope);
    }

    getReference(path: string, createIfNotFound: boolean = true): ScopeReference {
        const scopePath: string[] = path.split('.');
        let key: string = scopePath[0];
        let scope: Scope = this;
        let val: any = null;
        let len: number = scopePath.length;

        for (let i: number = 0; i < len; i++) {
            key = scopePath[i];

            val = scope.get(key, i === 0);
            const isNull: boolean = [null, undefined].indexOf(val) > -1;
            if (createIfNotFound && isNull && i + 1 < len) {
                val = new Scope(scope);
                scope.set(key, val);
            } else if (!createIfNotFound && isNull) {
                return null;
            }

            if (val && val instanceof Scope) {
                scope = val;
            }
        }

        return new ScopeReference(scope, key, val);
    }

    get(key: string, searchParents: boolean = true): any {
        const value: any = this.data[key];
        if (value === undefined) {
            if (searchParents && this.parentScope)
                return this.parentScope.get(key, searchParents);

            return '';
        }

        return this.data[key];
    }

    set(key: string, value: any) {
        if (this.data[key] === undefined)
            this.data.createField(key);

        if (typeof value === 'string') {
            const valueType = this.getType(key);
            switch (valueType) {
                case ScopeVariableType.Integer:
                    value = parseInt(value);
                    break;
                case ScopeVariableType.Float:
                    value = parseFloat(value);
                    break;
                case ScopeVariableType.Boolean:
                    value = [0, '0', 'false', ''].indexOf(value) === -1;
                    break;
            }

            if ([ScopeVariableType.Integer, ScopeVariableType.Float].indexOf(valueType) > -1 && isNaN(value)) {
                value = null;
            }
        }

        if (this.data[key] !== value) {
            const previousValue = this.data[key];
            this.data[key] = value;
            const event = {
                value: value,
                previousValue: previousValue,
                key: key
            };

            this.trigger(`change:${key}`, event);
            this.trigger('change', key, event);
        }

        if (this.keys.indexOf(key) === -1)
            this.keys.push(key);
    }

    has(key: string): boolean {
        return this.keys.indexOf(key) > -1;
    }

    setType(key: string, type: ScopeVariableType) {
        this.types[key] = type;
        if (this.has(key))
            this.set(key, this.get(key));
    }

    getType(key: string): ScopeVariableType {
        return this.types[key] || ScopeVariableType.String;
    }

    stringToType(str: string): ScopeVariableType {
        switch(str.toLowerCase()) {
            case 'int':
            case 'integer':
                return ScopeVariableType.Integer;
            case 'float':
                return ScopeVariableType.Float;
            case 'boolean':
            case 'bool':
                return ScopeVariableType.Boolean;
            default:
                return ScopeVariableType.String;
        }
    }

    extend(data) {
        for (const key of data) {
            this.set(key, data[key]);
        }
    }

    clear() {
        for (const key of this.keys) {
            if (['function', 'object'].indexOf(typeof this.get(key)) > -1) continue;
            this.set(key, null);
        }
    }

    cleanup() {
        this.children.length = 0;
        this.parentScope = null;
    }

    public setData(obj: {[key: string]: any}) {
        for (const d in obj) {
            this.set(d, obj[d]);
        }
    }

    public wrap(toWrap: any, triggerUpdates: boolean = false, updateFromWrapped: boolean = true) {
        if (toWrap instanceof Scope)
            toWrap = toWrap.data;

        if ([null, undefined].indexOf(this.wrapped) === -1)
            throw Error("A scope can only wrap a single object");

        if (!toWrap) {
            throw Error("Can only wrap objects.");
        }

        if (toWrap['$wrapped']) {
            console.error(toWrap);
            throw Error("An object should only be wrapped once.");
        }

        this.wrapped = toWrap;
        this.wrapped['$wrapped'] = true;
        for (const field in toWrap) {
            if (['constructor'].indexOf(field) > -1 || field.startsWith('$'))
                continue;

            if (this.wrapped[field] instanceof Function) {
                this.set(field, this.wrapped[field]);
                continue;
            }

            if (this.wrapped[field] instanceof Array && !(this.wrapped[field] instanceof WrappedArray)) {
                this.wrapped[field] = new WrappedArray(...toWrap[field]);
            }

            // Populate scope data from wrapped object before we update the getter
            if (updateFromWrapped && [null, undefined].indexOf(this.wrapped[field]) === -1) {
                this.set(field, this.wrapped[field]);
            }

            const getter = () => {
                return this.get(field);
            };

            const setter = (value: any) => {
                this.set(field, value);
            };

            Object.defineProperty(this.wrapped, field, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });

            if (triggerUpdates)
                this.trigger(`change:${field}`);
        }

        this.wrapped.get = this.get.bind(this);
        this.wrapped.set = this.set.bind(this);
        this.wrapped.bind = this.bind.bind(this);
        this.wrapped.once = this.once.bind(this);
        this.wrapped.unbind = this.unbind.bind(this);
    }

    public unwrap(): void {
        if (!this.wrapped)
            return;
        const toUnwrap = this.wrapped;
        this.wrapped = null;
        toUnwrap.$wrapped = false;
        for (const field in toUnwrap) {
            delete toUnwrap[field];
        }
    }
}
