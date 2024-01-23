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

export function method(config: {} | null = {}) {
    return function(target: any, key: string) {
        if(target.__methods__ == undefined) {
            target.__methods__ = [];
        }

        // Abstract/extended classes share __properties__
        if(target.__methods__.indexOf(key) == -1)
            target.__methods__.push(key);

        const getter = function() {
            return config;
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
    labels?: string[];
}

export class Property<T = any> extends EventDispatcher {
    _type: string = 'any';
    _value: T;
    config: IPropertyConfig;

    constructor(value?: T, config?: IPropertyConfig) {
        super();
        this.config = config;
        if (!this.config.labels)
            this.config.labels = [];
        if (!this.config.validators)
            this.config.validators = [];
        this.type = config.type || 'any';
        this.value = value;
    }

    deconstruct() {
        super.deconstruct();
        delete this._type;
        delete this._value;
        this.config = {};
    }

    castType(value) {
        const caster = Registry.instance.types.getSynchronous(this.type);
        return caster ? caster(value) : value;
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

    clean() {
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

    getValidator(id: string) {
        const validator = Registry.instance.validators.getSynchronous(id) as TValidator;
        if (!validator)
            throw new Error(`Invalid validator ${id}`);
        return validator;
    }

    addValidator(validator: TValidator | string) {
        if (typeof validator == 'string') {
            validator = this.getValidator(validator);
        }

        if (this.config.validators.indexOf(validator) == -1)
            this.config.validators.push(validator);
    }

    addLabel(label: string) {
        if(this.config.labels == undefined) {
            this.config.labels = [];
        }
        if(this.config.labels.indexOf(label) == -1) {
            this.config.labels.push(label);
        }
    }

    removeLabel(label: string) {
        if(this.config.labels == undefined) {
            return;
        }
        const index = this.config.labels.indexOf(label);
        if(index != -1) {
            this.config.labels.splice(index, 1);
        }
    }

    hasLabel(label: string) {
        return this.config.labels.indexOf(label) !== -1;
    }

    hasLabels(labels: string[]) {
        for(const label of labels) {
            if(!this.hasLabel(label)) {
                return false;
            }
        }
        return true;
    }
}
