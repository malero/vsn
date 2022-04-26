import { Property } from "./Property";
import { WrappedArray } from "../WrappedArray";
export declare class ArrayProperty<T = any> extends Property {
    _value: WrappedArray<T>;
    constructor(name: string, value: any);
    set value(v: any);
    get value(): any;
}
