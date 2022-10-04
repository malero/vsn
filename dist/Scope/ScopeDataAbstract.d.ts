import { IPropertyConfig, Property } from "./properties/Property";
import { EventDispatcher } from "../EventDispatcher";
export interface IScopeData {
    [key: string]: any;
}
export declare class ScopeDataAbstract extends EventDispatcher {
    [key: string]: any;
    __properties__: string[];
    __methods__: string[];
    protected _lastData: any;
    constructor();
    createMethod(name: string, method: (...args: any[]) => any): void;
    createProperty(name: string, propertyType?: any, config?: IPropertyConfig): any;
    hasProperty(name: string): boolean;
    get keys(): string[];
    getKeys(...tags: string[]): string[];
    setData(data: IScopeData): void;
    getData(...tags: string[]): IScopeData;
    get(key: string): any;
    set(key: string, value: any): void;
    getProperties(): string[];
    getProperty(name: string, create?: boolean): Property;
    bindToProperties(event: string, properties: string[], callback: (...args: any[]) => any): void;
    setLastData(): void;
    revert(): void;
    isModified(): boolean;
}
