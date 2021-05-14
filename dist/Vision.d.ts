import { DOM } from "./DOM";
import { EventDispatcher } from "simple-ts-event-dispatcher";
import { IPromise } from "simple-ts-promise";
export declare class Vision extends EventDispatcher {
    protected static _instance: Vision;
    protected dom?: DOM;
    protected controllers: {
        [key: string]: any;
    };
    constructor();
    setup(): void;
    registerClass(cls: any, constructorName?: string): void;
    getClass(key: string): IPromise<any>;
    static get instance(): Vision;
}
export declare const vision: Vision;
