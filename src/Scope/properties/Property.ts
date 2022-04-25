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

export interface IPropertyConfig {
    type?: string;
    default?: any;
}

export class Property extends EventDispatcher {
    _type: string = 'any';
    _value: any;
    config: IPropertyConfig;

    constructor(value?:any, config?: IPropertyConfig) {
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
}
