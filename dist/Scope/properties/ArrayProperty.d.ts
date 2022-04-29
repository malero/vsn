import { IPropertyConfig, Property } from "./Property";
import { WrappedArray } from "../WrappedArray";
export declare class ArrayProperty<T = any> extends Property<WrappedArray<T>> {
    _value: WrappedArray<T>;
    allKey: number;
    constructor(value?: any, config?: IPropertyConfig);
    deconstruct(): void;
    relayEvent(event: any, ...args: any[]): void;
    set value(v: any);
    get value(): any;
    clean(): T[];
}
