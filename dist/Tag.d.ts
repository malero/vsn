import { Scope } from "./Scope";
import { Attribute } from "./Attribute";
import { EventDispatcher } from "simple-ts-event-dispatcher";
import { DOM } from "./DOM";
export declare class Tag extends EventDispatcher {
    readonly element: HTMLElement;
    readonly dom: DOM;
    readonly rawAttributes: {
        [key: string]: string;
    };
    protected attributes: Attribute[];
    protected _parent: Tag;
    protected _scope: Scope;
    static readonly attributeMap: {
        [attr: string]: any;
    };
    protected inputTags: string[];
    constructor(element: HTMLElement, dom: DOM);
    readonly isInput: boolean;
    parent: Tag;
    scope: Scope;
    wrapScope(cls: any): void;
    decompose(): void;
    getAttribute(key: string): Attribute;
    buildAttributes(): void;
    setupAttributes(): void;
}
