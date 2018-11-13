import {DataModel} from "simple-ts-models";
import {EventDispatcher} from "simple-ts-event-dispatcher";

export class ScopeReference {
    constructor(
        public readonly scope: Scope,
        public readonly key: string,
        public readonly value: any
    ) {}
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
            if (val === undefined && i + 1 < len) {
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
        if (value === undefined || value === null) {
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

    clear() {
        for (const key of this.keys) {
            this.set(key, null);
        }
    }

    cleanup() {
        this.children.length = 0;
        this.parent = null;
    }

    public wrap(wrapped: any) {
        if (this.wrapped !== undefined)
            throw Error("A scope can only wrap a single object");

        this.wrapped = wrapped;
        for (const field in wrapped) {
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
        }
    }
}
