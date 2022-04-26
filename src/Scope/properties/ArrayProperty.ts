import {Property} from "./Property";
import {WrappedArray} from "../WrappedArray";

export class ArrayProperty<T = any> extends Property {
    _value: WrappedArray<T>;

    constructor(name: string, value: any) {
        super(name, value);

        this._value = new WrappedArray<any>();
        this._value.dispatcher.addRelay(this);
        this.value = value;
    }

    set value(v:any) {
        if (!(v instanceof Array))
            v = [v];

        this._value.splice(0, this._value.length);

        for (let i = 0; i < v.length; i++)
            this._value.push(v[i]);
    }

    get value() {
        return this._value;
    }
}
