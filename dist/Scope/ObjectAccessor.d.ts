import { ScopeAbstract } from "./ScopeAbstract";
export declare class ObjectAccessor extends ScopeAbstract {
    readonly data: any;
    constructor(data: any);
    get(field: string, fallback?: any): any;
    set(field: string, value: any): void;
}
