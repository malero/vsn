import { DataModel } from "simple-ts-models";
import { EventCallback, EventDispatcher, EventDispatcherCallback } from "simple-ts-event-dispatcher";
export declare class ScopeReference {
    readonly scope: Scope;
    readonly key: string;
    readonly value: any;
    constructor(scope: Scope, key: string, value: any);
}
export declare class ScopeVariableType {
    static readonly Integer: string;
    static readonly Float: string;
    static readonly Boolean: string;
    static readonly String: string;
}
export declare class WrappedArray<T> extends Array<T> {
    private _listeners;
    private _lastKey;
    readonly $wrapped: boolean;
    constructor(...items: T[]);
    push(...items: T[]): number;
    splice(start: number, deleteCount?: number): T[];
    get length(): number;
    set length(num: number);
    bind(event: string, fct: EventDispatcherCallback, context?: any, once?: boolean): number;
    once(event: string, fct: EventDispatcherCallback, context?: any): number;
    unbind(event: string, key?: number): boolean;
    unbindWithContext(event: string, context: any): number;
    getListener(event: string, key: number): EventCallback | undefined;
    trigger(event: string, ...args: any[]): void;
}
export declare class Scope extends EventDispatcher {
    wrapped: any;
    protected data: DataModel;
    protected types: {
        [key: string]: string;
    };
    protected children: Scope[];
    protected keys: string[];
    protected _parentScope: Scope;
    constructor(parent?: Scope);
    get parentScope(): Scope;
    set parentScope(scope: Scope);
    addChild(scope: Scope): void;
    getReference(path: string, createIfNotFound?: boolean): ScopeReference;
    get(key: string, searchParents?: boolean): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
    setType(key: string, type: string): void;
    getType(key: string): string;
    extend(data: any): void;
    clear(): void;
    cleanup(): void;
    setData(obj: {
        [key: string]: any;
    }): void;
    wrap(toWrap: any, triggerUpdates?: boolean, updateFromWrapped?: boolean): void;
    unwrap(): void;
}
