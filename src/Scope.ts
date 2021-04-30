import {DataModel} from "simple-ts-models";
import {EventCallback, EventCallbackList, EventDispatcher, EventDispatcherCallback} from "simple-ts-event-dispatcher";

export class ScopeReference {
    constructor(
        public readonly scope: Scope,
        public readonly key: string,
        public readonly value: any
    ) {}
}

export class WrappedArray<T> extends Array<T> {
    private _listeners: EventCallbackList;
    private _lastKey: number;
    public readonly __wrapped__: boolean = true;

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
        if(event in this._listeners === false) return false;
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
        if(event in this._listeners === false) return 0;
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
        if(event in this._listeners === false) return;

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
    protected wrapped: any;
    protected data: DataModel;
    protected children: Scope[];
    protected keys: string[];
    protected _parent: Scope;

    constructor(
        parent?: Scope
    ) {
        super();
        if (parent)
            this.parent = parent;
        this.children = [];
        this.data = new DataModel({});
        this.keys = [];
    }

    public get parent(): Scope {
        return this._parent;
    }

    public set parent(scope: Scope) {
        this._parent = scope;
        scope.addChild(this);
    }

    public addChild(scope: Scope) {
        this.children.push(scope);
    }

    getReference(path: string): ScopeReference {
        const scopePath: string[] = path.split('.');
        let key: string = scopePath[0];
        let scope: Scope = this;
        let val: any = null;
        let len: number = scopePath.length;

        for (let i: number = 0; i < len; i++) {
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
    }

    get(key: string, searchParents: boolean = true): any {
        const value: any = this.data[key];
        if (value === undefined) {
            if (searchParents && this.parent)
                return this.parent.get(key, searchParents);

            return '';
        }

        return this.data[key];
    }

    set(key: string, value: any) {
        if (this.data[key] === undefined)
            this.data.createField(key);

        if (this.data[key] !== value) {
            this.data[key] = value;
            this.trigger(`change:${key}`, value);
            this.trigger('change', key, value);
        }

        if (this.keys.indexOf(key) === -1)
            this.keys.push(key);
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
        this.parent = null;
    }

    public wrap(wrapped: any, triggerUpdates: boolean = false) {
        if (this.wrapped !== undefined)
            throw Error("A scope can only wrap a single object");

        if (wrapped['__wrapped__'])
            throw Error("An object should only be wrapped once.")

        this.wrapped = wrapped;
        this.wrapped['__wrapped__'] = true;
        for (const field in wrapped) {
            if (['constructor'].indexOf(field) > -1)
                continue;

            if (this.wrapped[field] instanceof Array) {
                this.wrapped[field] = new WrappedArray(...wrapped[field]);
            }

            const getter = () => {
                let val = this.wrapped[field];
                if (typeof val === 'function')
                    val = val.bind(this.data);
                return val;
            };

            const setter = (value: any) => {
                this.wrapped[field] = value;
                this.trigger(`change:${field}`, value);
                this.trigger('change', field, value);
            };

            Object.defineProperty(this.data, field, {
                get: getter,
                set: setter,
                enumerable: true,
                configurable: true
            });

            if (triggerUpdates)
                this.trigger(`change:${field}`);
        }
    }
}