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
    protected data: DataModel;

    constructor(
        protected parent?: Scope
    ) {
        super();
        this.data = new DataModel({});
    }

    getReference(path: string): ScopeReference {
        const scopePath: string[] = path.split('.');
        let key: string = scopePath[0];
        let scope: Scope = this;
        let val: any = null;
        let len: number = scopePath.length;

        for (let i: number = 0; i < len; i++) {
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
    }

    get(key: string): any {
        if (!this.data[key] && this.parent)
            return this.parent.get(key);

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
    }
}


export class Wrapper extends Scope {
    constructor(
        public readonly wrapped: any, // Instantiated object from v-controller attribute,
        parent?: Scope
    ) {
        super(parent);

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
