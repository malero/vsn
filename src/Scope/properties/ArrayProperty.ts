import {IPropertyConfig, Property} from "./Property";
import {WrappedArray} from "../WrappedArray";

export class ArrayProperty<T = any> extends Property<WrappedArray<T>> {
    _value: WrappedArray<T>;
    allKey: number;

    constructor(value?: any, config?: IPropertyConfig) {
        super(new WrappedArray<any>(), config);
        this.allKey = this._value.dispatcher.all(this.relayEvent.bind(this), this);
        if (value !== undefined) {
            this.value = value;
        }
    }

    deconstruct() {
        this._value.dispatcher.none(this.allKey);
        super.deconstruct();
    }

    relayEvent(event, ...args) {
        this.dispatch('change', ...args);
    }

    set value(v: any) {
        if (!(v instanceof Array))
            v = [v];

        if (this._value instanceof WrappedArray) {
            this._value.splice(0, this._value.length);

            for (let i = 0; i < v.length; i++)
                this._value.push(v[i]);
        } else if (v instanceof WrappedArray) {
            this._value = v;
        }
    }

    get value() {
        return this._value;
    }
}
