import { Scope } from "../Scope";
export declare class ScopeReference {
    private _scope;
    private _key;
    private _value;
    constructor(scope?: Scope, key?: string, value?: any);
    getScope(): Promise<Scope>;
    getKey(): Promise<string>;
    getValue(): Promise<any>;
}
