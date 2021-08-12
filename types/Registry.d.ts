import { EventDispatcher } from "simple-ts-event-dispatcher";
import { IPromise } from "simple-ts-promise";
export declare function register(store: string, key?: string, setup?: () => void): (target: any, _key?: string) => void;
export declare class RegistryStore extends EventDispatcher {
    private timeouts;
    private readonly store;
    constructor(defaults?: any);
    register(key: string, item: any): void;
    get(key: string): IPromise<any>;
    getSynchronous(key: string): any;
}
export declare class Registry extends EventDispatcher {
    protected static _instance: Registry;
    readonly classes: RegistryStore;
    readonly models: RegistryStore;
    readonly templates: RegistryStore;
    readonly types: RegistryStore;
    readonly formats: RegistryStore;
    readonly attributes: RegistryStore;
    constructor();
    static class(key?: string, setup?: any): (target: any, _key?: string) => void;
    static model(key?: string, setup?: any): (target: any, _key?: string) => void;
    static template(key?: string, setup?: any): (target: any, _key?: string) => void;
    static type(key?: string, setup?: any): (target: any, _key?: string) => void;
    static format(key?: string, setup?: any): (target: any, _key?: string) => void;
    static attribute(attributeName?: string, setup?: any): (target: any, _key?: string) => void;
    static get instance(): Registry;
}
