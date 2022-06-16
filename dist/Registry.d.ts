import { EventDispatcher } from "./EventDispatcher";
import { IPromise } from "./SimplePromise";
import { ClassNode } from "./AST/ClassNode";
export declare function register(store: string, key?: string, setup?: () => void): (target: any, _key?: string) => void;
export declare class RegistryStore<T = any> extends EventDispatcher {
    private timeouts;
    private readonly store;
    constructor(defaults?: any);
    register(key: string, item: any): void;
    get(key: string): IPromise<any>;
    getSynchronous(key: string): T;
    has(key: string): boolean;
    get keys(): string[];
}
export declare class Registry extends EventDispatcher {
    protected static _instance: Registry;
    readonly tags: RegistryStore;
    readonly components: RegistryStore;
    readonly functions: RegistryStore;
    readonly controllers: RegistryStore;
    readonly classes: RegistryStore;
    readonly models: RegistryStore;
    readonly templates: RegistryStore;
    readonly services: RegistryStore;
    readonly types: RegistryStore;
    readonly validators: RegistryStore;
    readonly formats: RegistryStore;
    readonly attributes: RegistryStore;
    constructor();
    static component(key?: string, setup?: any): (target: any, _key?: string) => void;
    static function(key?: string, setup?: any): (target: any, _key?: string) => void;
    static class(cls: ClassNode): void;
    static controller(key?: string, setup?: any): (target: any, _key?: string) => void;
    static model(key?: string, setup?: any): (target: any, _key?: string) => void;
    static template(key?: string, setup?: any): (target: any, _key?: string) => void;
    static service(key?: string, setup?: any): (target: any, _key?: string) => void;
    static type(key?: string, setup?: any): (target: any, _key?: string) => void;
    static validator(key?: string, setup?: any): (target: any, _key?: string) => void;
    static format(key?: string, setup?: any): (target: any, _key?: string) => void;
    static attribute(attributeName?: string, setup?: any): (target: any, _key?: string) => void;
    static get instance(): Registry;
}
