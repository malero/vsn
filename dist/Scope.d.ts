import { EventDispatcher } from "./EventDispatcher";
import { ScopeReference } from "./Scope/ScopeReference";
import { ScopeData } from "./Scope/ScopeData";
export declare class Scope extends EventDispatcher {
    wrapped: any;
    protected data: ScopeData;
    protected types: {
        [key: string]: string;
    };
    protected children: Scope[];
    protected _keys: string[];
    protected _parentScope: Scope;
    constructor(parent?: Scope);
    get parentScope(): Scope;
    set parentScope(scope: Scope);
    addChild(scope: Scope): void;
    getReference(path: string, createIfNotFound?: boolean): ScopeReference;
    get(key: string, searchParents?: boolean): any;
    set(key: string, value: any): void;
    get keys(): string[];
    has(key: string): boolean;
    setType(key: string, type: string): void;
    getType(key: string): string;
    extend(data: any): void;
    clear(): void;
    cleanup(): void;
    wrap(toWrap: any, triggerUpdates?: boolean, updateFromWrapped?: boolean): void;
    unwrap(): void;
}
