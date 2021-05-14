import { Scope } from "./Scope";
import { Attribute } from "./Attribute";
import { EventDispatcher } from "simple-ts-event-dispatcher";
import { DOM } from "./DOM";
import { Controller } from "./Controller";
export declare class Tag extends EventDispatcher {
    readonly element: HTMLElement;
    readonly dom: DOM;
    readonly rawAttributes: {
        [key: string]: string;
    };
    readonly parsedAttributes: {
        [key: string]: string[];
    };
    protected attributes: Attribute[];
    protected _parent: Tag;
    protected _children: Tag[];
    protected _scope: Scope;
    protected _controller: Controller;
    static readonly attributeMap: {
        [attr: string]: any;
    };
    protected inputTags: string[];
    protected onclickHandlers: any[];
    constructor(element: HTMLElement, dom: DOM);
    mutate(mutation: MutationRecord): void;
    getAttributeClass(attr: string): any;
    getAttributeName(attr: string): string;
    getAttributeBinding(attr: string): string;
    get isInput(): boolean;
    addChild(tag: Tag): void;
    get parent(): Tag;
    set parent(tag: Tag);
    get scope(): Scope;
    set scope(scope: Scope);
    get controller(): Controller;
    set controller(controller: Controller);
    isConstructor(obj: any): boolean;
    wrap(obj: any, triggerUpdates?: boolean): any;
    decompose(): void;
    recompose(): void;
    hide(): void;
    show(): void;
    findAncestorByAttribute(attr: string): Tag;
    hasAttribute(attr: string): boolean;
    getAttribute(key: string): Attribute;
    getRawAttributeValue(key: string, fallback?: any): any;
    getParsedAttributeValue(key: string, index?: number, fallback?: any): any;
    buildAttributes(): Promise<void>;
    setupAttributes(): Promise<void>;
    executeAttributes(): Promise<void>;
    protected onclick(e: any): void;
    addClickHandler(handler: any): void;
}
