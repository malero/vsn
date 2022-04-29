import { EventDispatcher } from "../../EventDispatcher";
export declare function property(propertyType?: typeof Property, config?: {} | null): (target: any, key: string) => void;
export declare type TValidator = (value: any) => string[];
export interface IPropertyConfig {
    type?: string;
    default?: any;
    validators?: TValidator[];
    tags?: string[];
}
export declare class Property<T = any> extends EventDispatcher {
    _type: string;
    _value: T;
    config: IPropertyConfig;
    constructor(value?: T, config?: IPropertyConfig);
    castType(value: any): any;
    set value(v: any);
    get value(): any;
    clean(): any;
    set type(type: string);
    get type(): string;
    validate(): any[];
    addTag(tag: string): void;
    removeTag(tag: string): void;
    hasTag(tag: string): boolean;
    hasTags(tags: string[]): boolean;
}
