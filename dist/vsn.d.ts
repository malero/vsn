import { DOM } from "./DOM";
import { Registry } from "./Registry";
import "./Types";
import "./Formats";
import { Configuration } from "./Configuration";
import { EventDispatcher } from "./EventDispatcher";
export declare class Vision extends EventDispatcher {
    protected static _instance: Vision;
    protected _dom?: DOM;
    readonly registry: Registry;
    readonly config: Configuration;
    constructor();
    get dom(): DOM;
    eval(code: string): Promise<any>;
    setup(): Promise<void>;
    static get instance(): Vision;
}
export * from "./attributes/_imports";
export * from './Registry';
export * from './Attribute';
export * from './AST';
export { DOM } from './DOM';
export { Scope } from './Scope';
export { ScopeReference } from './Scope/ScopeReference';
export { WrappedArray } from './Scope/WrappedArray';
export { Controller } from './Controller';
export { Property, property } from './Scope/properties/Property';
export { Tag } from './Tag';
export declare const vision: Vision;