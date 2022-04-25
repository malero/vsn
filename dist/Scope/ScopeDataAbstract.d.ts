import { IPropertyConfig, Property } from "./properties/Property";
import { EventDispatcher } from "../EventDispatcher";
export interface IScopeData {
    [key: string]: any;
}
export declare class ScopeDataAbstract extends EventDispatcher {
    [key: string]: any;
    __properties__: string[];
    protected _lastData: any;
    constructor();
    createProperty(name: string, propertyType?: typeof Property, config?: IPropertyConfig): Property;
    hasProperty(name: string): boolean;
    get keys(): string[];
    setData(data: IScopeData): void;
    getData(): IScopeData;
    getProperties(): string[];
    getProperty(name: string, create?: boolean): Property;
    bindToProperties(event: string, properties: string[], callback: (...args: any[]) => any): void;
    setLastData(): void;
    revert(): void;
    isModified(): boolean;
}
