import { Scope } from "../Scope";
import { ScopeReference } from "./ScopeReference";
export declare class QueryReference extends ScopeReference {
    readonly path: string;
    readonly scope: Scope;
    constructor(path: string, scope: Scope);
    getScope(): Promise<any>;
    getKey(): Promise<string>;
    getValue(): Promise<any>;
}
