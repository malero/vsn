import { DataModel } from "simple-ts-models";
import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare class ScopeReference {
    readonly scope: Scope;
    readonly key: string;
    readonly value: any;
    constructor(scope: Scope, key: string, value: any);
}
export declare class Scope extends EventDispatcher {
    protected wrapped: any;
    protected data: DataModel;
    protected children: Scope[];
    protected keys: string[];
    protected _parent: Scope;
    constructor(parent?: Scope);
    parent: Scope;
    addChild(scope: Scope): void;
    getReference(path: string): ScopeReference;
    get(key: string, searchParents?: boolean): any;
    set(key: string, value: any): void;
    clear(): void;
    cleanup(): void;
    wrap(wrapped: any): void;
}
