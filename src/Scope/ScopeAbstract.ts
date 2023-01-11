import {EventDispatcher} from "../EventDispatcher";

export interface IScope {
    get(field: string, fallback?: any): any;
    set(field: string, value: any): void;
}

export abstract class ScopeAbstract extends EventDispatcher implements IScope {
    public abstract get(field: string, fallback?: any): any;
    public abstract set(field: string, value: any): void;
}
