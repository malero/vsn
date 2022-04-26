import { IPropertyConfig, Property } from "./Property";
import { WrappedArray } from "../WrappedArray";
export declare class ArrayProperty<T = any> extends Property<WrappedArray<T>> {
    _value: WrappedArray<T>;
    constructor(value?: any, config?: IPropertyConfig);
    set value(v: any);
    get value(): any;
}
