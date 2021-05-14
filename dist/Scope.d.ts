import { DataModel } from "simple-ts-models";
import { EventCallback, EventDispatcher, EventDispatcherCallback } from "simple-ts-event-dispatcher";
export declare class ScopeReference {
    readonly scope: Scope;
    readonly key: string;
    readonly value: any;
    constructor(scope: Scope, key: string, value: any);
}
export declare class WrappedArray<T> extends Array<T> {
    private _listeners;
    private _lastKey;
    readonly __wrapped__: boolean;
    constructor(...items: T[]);
    push(...items: T[]): number;
    bind(event: string, fct: EventDispatcherCallback, context?: any, once?: boolean): number;
    once(event: string, fct: EventDispatcherCallback, context?: any): number;
    unbind(event: string, key?: number): boolean;
    unbindWithContext(event: string, context: any): number;
    getListener(event: string, key: number): EventCallback | undefined;
    trigger(event: string, ...args: any[]): void;
}
export declare class Scope extends EventDispatcher {
    protected wrapped: any;
    protected data: DataModel;
    protected children: Scope[];
    protected keys: string[];
    protected _parent: Scope;
    constructor(parent?: Scope);
    get parent(): Scope;
    set parent(scope: Scope);
    addChild(scope: Scope): void;
    getReference(path: string): ScopeReference;
    get(key: string, searchParents?: boolean): any;
    set(key: string, value: any): void;
    extend(data: any): void;
    clear(): void;
    cleanup(): void;
    wrap(wrapped: any, triggerUpdates?: boolean): void;
}
