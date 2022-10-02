import { Scope } from "./Scope";
import { ScopeObject } from "./Scope/ScopeObject";
export declare class Service extends ScopeObject {
    protected static _instance: Service;
    protected _scope: Scope;
    constructor();
    get scope(): Scope;
    static get instance(): Service;
}
