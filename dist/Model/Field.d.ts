import { IPropertyConfig, Property } from "../Scope/properties/Property";
export interface IFieldConfig extends IPropertyConfig {
    validators?: string[];
}
export declare class Field extends Property {
    config: IFieldConfig;
    validate(): any[];
}
