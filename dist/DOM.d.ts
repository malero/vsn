import { AbstractDOM } from "./DOM/AbstractDOM";
export declare class DOM extends AbstractDOM {
    protected static _instance: AbstractDOM;
    static get instance(): DOM;
}
