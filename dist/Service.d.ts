import { ScopeData } from "./Scope/ScopeData";
import { Scope } from "./Scope";
export declare class Service extends ScopeData {
    protected static _instance: Service;
    protected _scope: Scope;
    constructor();
    get scope(): Scope;
    static get instance(): Service;
}
