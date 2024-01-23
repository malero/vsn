import { EventDispatcher } from "../../EventDispatcher";
export declare function property(propertyType?: typeof Property, config?: {} | null): (target: any, key: string) => void;
export declare function method(config?: {} | null): (target: any, key: string) => void;
export declare type TValidator = (value: any) => string[];
export interface IPropertyConfig {
    type?: string;
    default?: any;
    validators?: TValidator[];
    labels?: string[];
}
export declare class Property<T = any> extends EventDispatcher {
    _type: string;
    _value: T;
    config: IPropertyConfig;
    constructor(value?: T, config?: IPropertyConfig);
    deconstruct(): void;
    castType(value: any): any;
    set value(v: any);
    get value(): any;
    clean(): any;
    set type(type: string);
    get type(): string;
    validate(): any[];
    getValidator(id: string): TValidator;
    addValidator(validator: TValidator | string): void;
    addLabel(label: string): void;
    removeLabel(label: string): void;
    hasLabel(label: string): boolean;
    hasLabels(labels: string[]): boolean;
}
