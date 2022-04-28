import {EventDispatcher} from "../../EventDispatcher";
import {Registry} from "../../Registry";

export function property(propertyType = Property, config: {} | null = {}) {
    return function(target: any, key: string) {
        if(target.__properties__ == undefined) {
            target.__properties__ = [];
        }

        // Abstract/extended classes share __properties__
        if(target.__properties__.indexOf(key) == -1)
            target.__properties__.push(key);

        const getter = function() {
            return [propertyType, config];
        };

        Object.defineProperty(target, '__'+key+'__', {
            get: getter,
            set: v => {},
            enumerable:false,
            configurable: true
        });
    }
}

export type TValidator = (value: any) => string[];

export interface IPropertyConfig {
    type?: string;
    default?: any;
    validators?: TValidator[];
    tags?: string[];
}

export class Property<T = any> extends EventDispatcher {
    _type: string = 'any';
    _value: T;
    config: IPropertyConfig;

    constructor(value?: T, config?: IPropertyConfig) {
        super();
        this.config = config;
        this.type = config.type || 'any';
        this.value = value;
    }

    castType(value) {
        const caster = Registry.instance.types.getSynchronous(this.type);
        return caster(value);
    }

    set value(v:any) {
        const oldValue = this._value;
        this._value = this.castType(v);
        if (this._value !== oldValue) {
            this.dispatch('change', {
                oldValue:oldValue,
                value:v
            });
        }
    }

    get value() {
        return this._value;
    }

    getData() {
        return this.value;
    }

    set type(type: string) {
        if (this._type != type) {
            this._type = type;
            this.value = this.value; // Need to reset value to have it cast to the new type
        }
    }

    get type(): string {
        return this._type;
    }

    validate() {
        const errors = [];
        for(const validator of this.config.validators || []) {
            errors.concat(validator(this.value));
        }

        return errors;
    }

    hasTag(tag: string) {
        return this.config.tags?.indexOf(tag) !== -1;
    }
}
