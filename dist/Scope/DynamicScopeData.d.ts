import { IScopeData, ScopeDataAbstract } from "./ScopeDataAbstract";
export declare class DynamicScopeData extends ScopeDataAbstract {
    constructor(data: IScopeData | string[]);
    setData(data: IScopeData): void;
    on(event: string, fct: (...args: any[]) => any, context?: any, once?: boolean): number;
}
