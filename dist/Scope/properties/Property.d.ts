import { EventDispatcher } from "../../EventDispatcher";
export declare function property(propertyType?: typeof Property, config?: {} | null): (target: any, key: string) => void;
export interface IPropertyConfig {
    type?: string;
    default?: any;
}
export declare class Property extends EventDispatcher {
    type: string;
    _value: any;
    config: IPropertyConfig;
    constructor(value?: any, config?: IPropertyConfig);
    castType(value: any): any;
    set value(v: any);
    get value(): any;
    getData(): any;
}
