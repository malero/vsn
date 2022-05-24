import {EventDispatcher} from "./EventDispatcher";
import {ScopeReference} from "./Scope/ScopeReference";
import {QueryReference} from "./Scope/QueryReference";
import {WrappedArray} from "./Scope/WrappedArray";
import {ScopeData} from "./Scope/ScopeData";
import {DynamicScopeData} from "./Scope/DynamicScopeData";


export class Scope extends EventDispatcher {
    public wrapped: any;
    protected _data: ScopeData;
    protected children: Scope[];
    protected _parentScope: Scope;

    constructor(
        parent?: Scope
    ) {
        super();
        if (parent)
            this.parentScope = parent;
        this.children = [];
        this._data = new DynamicScopeData({});
        this._data.addRelay(this);
    }

    public get data(): ScopeData {
        return this._data;
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

        if (path.startsWith('?')) {
            return new QueryReference(path, scope);
        }

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
        const value: any = this._data[key];
        if (value === undefined) {
            if (searchParents && this.parentScope)
                return this.parentScope.get(key, searchParents);

            return '';
        }

        return value;
    }

    set(key: string, value: any) {
        if (!this._data.hasProperty(key))
            this._data.createProperty(key);
        this._data[key] = value;
    }

    get keys(): string[] {
        return this._data.keys;
    }

    has(key: string): boolean {
        return this._data.hasProperty(key);
    }

    setType(key: string, type: string) {
        const property = this._data.getProperty(key, true);
        property.type = type;
        if (this.has(key))
            this.set(key, this.get(key));
    }

    getType(key: string): string {
        const property = this._data.getProperty(key);
        return property?.type;
    }

    extend(data) {
        for (const key of data) {
            this.set(key, data[key]);
        }
    }

    clear() {
        for (const key of this._data.keys) {
            if (['function', 'object'].indexOf(typeof this.get(key)) > -1) continue;
            this.set(key, null);
        }
    }

    cleanup() {
        this.children.length = 0;
        this.parentScope = null;
    }

    public wrap(toWrap: any, triggerUpdates: boolean = false, updateFromWrapped: boolean = true) {
        if (toWrap instanceof ScopeData) {
            if (this._data instanceof EventDispatcher) {
                this._data.removeRelay(this);
                this._data.deconstruct();
            }
            this.wrapped = toWrap;
            this._data = toWrap;
            this._data.addRelay(this);
            return;
        }

        if (toWrap instanceof Scope)
            toWrap = toWrap._data;

        if ([null, undefined].indexOf(this.wrapped) === -1)
            throw Error("A scope can only wrap a single object");

        if (!toWrap) {
            throw Error("Can only wrap objects.");
        }

        if (toWrap['$wrapped']) {
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

            if (this.wrapped[field] instanceof Array) {
                if (!(this.wrapped[field] instanceof WrappedArray)) {
                    this.wrapped[field] = new WrappedArray(...toWrap[field]);
                }
                this.wrapped[field].on('change', (...args) => {
                    this.dispatch(`change:${field}`, ...args);
                })
            }

            if (typeof this.wrapped[field] == 'object' && this.wrapped[field] && this.wrapped[field].constructor === Object) {
                const innerObject = new Scope(this);
                innerObject.wrap(this.wrapped[field]);
                this.wrapped[field] = innerObject;
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
                this.dispatch(`change:${field}`);
        }

        this.wrapped.get = this.get.bind(this);
        this.wrapped.set = this.set.bind(this);
        this.wrapped.on = this.on.bind(this);
        this.wrapped.once = this.once.bind(this);
        this.wrapped.off = this.off.bind(this);
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

    public static fromObject(obj, parentScope?: Scope): Scope {
        const scope = new Scope(parentScope);
        scope.wrap(obj);
        return scope;
    }
}

export class FunctionScope extends Scope {
    set(key: string, value: any) {
        if (this.parentScope.has(key) || ['$', '@'].indexOf(key[0]) > -1)
            this.parentScope.set(key, value);
        else
            super.set(key, value);
    }
}
