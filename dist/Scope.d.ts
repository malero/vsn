import { EventDispatcher, EventDispatcherCallback } from "./EventDispatcher";
import { DataModel } from "./Model/DataModel";
export declare class ScopeReference {
    private _scope;
    private _key;
    private _value;
    constructor(scope?: Scope, key?: string, value?: any);
    getScope(): Promise<Scope>;
    getKey(): Promise<string>;
    getValue(): Promise<any>;
}
export declare class QueryReference extends ScopeReference {
    readonly path: string;
    readonly scope: Scope;
    constructor(path: string, scope: Scope);
    getScope(): Promise<any>;
    getKey(): Promise<string>;
    getValue(): Promise<any>;
}
export declare class ScopeVariableType {
    static readonly Integer: string;
    static readonly Float: string;
    static readonly Boolean: string;
    static readonly String: string;
}
export declare class WrappedArray<T> extends Array<T> {
    private dispatcher;
    readonly $wrapped: boolean;
    constructor(...items: T[]);
    dispatch(event: string, ...args: any[]): void;
    on(event: string, callback: EventDispatcherCallback): void;
    off(event: string, key?: number): void;
    once(event: string, callback: EventDispatcherCallback): void;
    push(...items: T[]): number;
    splice(start: number, deleteCount?: number): T[];
    get(key: string): any;
    get length(): number;
    set length(num: number);
    setLength(num: number): void;
}
export declare class Scope extends EventDispatcher {
    wrapped: any;
    protected data: DataModel;
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
