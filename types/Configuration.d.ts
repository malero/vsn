import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare type ConfigurationValue = string | number | boolean | null | undefined;
export declare class Configuration extends EventDispatcher {
    protected static _instance: Configuration;
    private readonly data;
    constructor();
    get(key: string, defaultValue?: ConfigurationValue): ConfigurationValue;
    set(key: string, value: ConfigurationValue): void;
    static set(key: string, value: ConfigurationValue): void;
    static get(key: string, defaultValue?: ConfigurationValue): ConfigurationValue;
    static get instance(): Configuration;
}
