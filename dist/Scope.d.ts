import { ScopeReference } from "./Scope/ScopeReference";
import { ScopeData } from "./Scope/ScopeData";
import { ScopeAbstract } from "./Scope/ScopeAbstract";
export declare class Scope extends ScopeAbstract {
    wrapped: any;
    protected _data: ScopeData;
    protected children: Scope[];
    protected _parentScope: Scope;
    protected _isGarbage: boolean;
    constructor(parent?: Scope);
    deconstruct(): void;
    get data(): ScopeData;
    get objectify(): any;
    get parentScope(): Scope;
    set parentScope(scope: Scope);
    addChild(scope: Scope): void;
    removeChild(scope: Scope): void;
    getReference(path: string, createIfNotFound?: boolean): ScopeReference;
    get(key: string, searchParents?: boolean): any;
    set(key: string, value: any, detectType?: boolean): void;
    remove(key: string): void;
    get keys(): string[];
    has(key: string): boolean;
    setType(key: string, type: string): void;
    getType(key: string): string;
    extend(data: any): void;
    clear(): void;
    cleanup(): void;
    get isGarbage(): boolean;
    collectGarbage(force?: boolean): void;
    wrap(toWrap: any, triggerUpdates?: boolean, updateFromWrapped?: boolean): void;
    unwrap(): void;
    static fromObject(obj: any, parentScope?: Scope): Scope;
}
export declare class FunctionScope extends Scope {
    constructor(parentScope?: Scope);
    set(key: string, value: any): void;
    collectGarbage(force?: boolean): void;
}
