import { EventDispatcher } from "../../EventDispatcher";
export declare function property(propertyType?: typeof Property, config?: {} | null): (target: any, key: string) => void;
export declare type TValidator = (value: any) => string[];
export interface IPropertyConfig {
    type?: string;
    default?: any;
    validators?: TValidator[];
}
export declare class Property extends EventDispatcher {
    _type: string;
    _value: any;
    config: IPropertyConfig;
    constructor(value?: any, config?: IPropertyConfig);
    castType(value: any): any;
    set value(v: any);
    get value(): any;
    getData(): any;
    set type(type: string);
    get type(): string;
    validate(): any[];
}
