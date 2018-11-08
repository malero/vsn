import { DOM } from "./DOM";
export declare class Vision {
    protected dom?: DOM;
    constructor();
    setup(): void;
    parse(str: string): any;
}
export declare const vision: Vision;
