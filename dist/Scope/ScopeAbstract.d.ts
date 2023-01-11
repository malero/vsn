import { EventDispatcher } from "../EventDispatcher";
export interface IScope {
    get(field: string, fallback?: any): any;
    set(field: string, value: any): void;
}
export declare abstract class ScopeAbstract extends EventDispatcher implements IScope {
    abstract get(field: string, fallback?: any): any;
    abstract set(field: string, value: any): void;
}
