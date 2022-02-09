import { DOM } from "./DOM";
import { EventDispatcher } from "simple-ts-event-dispatcher";
import { Registry } from "./Registry";
import "./Types";
import "./Formats";
import "./attributes/_imports";
import { Configuration } from "./Configuration";
export declare class Vision extends EventDispatcher {
    protected static _instance: Vision;
    protected _dom?: DOM;
    readonly registry: Registry;
    readonly config: Configuration;
    constructor();
    get dom(): DOM;
    eval(code: string): Promise<any>;
    setup(): Promise<void>;
    static get instance(): Vision;
}
export * from './Registry';
export * from './Attribute';
export declare const vision: Vision;