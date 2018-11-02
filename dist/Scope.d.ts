import { DataModel } from "simple-ts-models";
import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare class ScopeReference {
    readonly scope: Scope;
    readonly key: string;
    readonly value: any;
    constructor(scope: Scope, key: string, value: any);
}
export declare class Scope extends EventDispatcher {
    protected parent?: Scope;
    protected data: DataModel;
    constructor(parent?: Scope);
    getReference(path: string): ScopeReference;
    get(key: string): any;
    set(key: string, value: any): void;
}
export declare class Wrapper extends Scope {
    readonly wrapped: any;
    constructor(wrapped: any, // Instantiated object from v-controller attribute,
    parent?: Scope);
}
