import { VOM } from "./VOM";
import { Scope } from "./Scope";
export declare class Vision {
    protected scope: Scope;
    protected vom?: VOM;
    constructor();
    setup(): void;
}
export declare const vision: Vision;
