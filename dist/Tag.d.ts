import { Scope } from "./Scope";
import { Attribute } from "./Attribute";
import { EventDispatcher } from "simple-ts-event-dispatcher";
import { DOM } from "./DOM";
import { Controller } from "./Controller";
export declare enum TagState {
    Instantiated = 0,
    AttributesBuilt = 1,
    AttributesSetup = 2,
    AttributesExtracted = 3,
    AttributesConnected = 4,
    Built = 5
}
export declare class Tag extends EventDispatcher {
    readonly element: HTMLElement;
    readonly dom: DOM;
    readonly rawAttributes: {
        [key: string]: string;
    };
    readonly parsedAttributes: {
        [key: string]: string[];
    };
    protected _state: TagState;
    protected attributes: Attribute[];
    protected _parentTag: Tag;
    protected _children: Tag[];
    protected _scope: Scope;
    protected _controller: Controller;
    static readonly attributeMap: {
        [attr: string]: any;
    };
    protected inputTags: string[];
    protected onclickHandlers: any[];
    constructor(element: HTMLElement, dom: DOM);
    evaluate(): void;
    mutate(mutation: MutationRecord): void;
    getAttributeClass(attr: string): any;
    getAttributeName(attr: string): string;
    getAttributeBinding(attr: string): string;
    get isInput(): boolean;
    addChild(tag: Tag): void;
    get parentTag(): Tag;
    set parentTag(tag: Tag);
    get scope(): Scope;
    set scope(scope: Scope);
    get controller(): Controller;
    set controller(controller: Controller);
    wrap(obj: any, triggerUpdates?: boolean): any;
    unwrap(): void;
    removeFromDOM(): void;
    addToParentElement(): void;
    hide(): void;
    show(): void;
    findAncestorByAttribute(attr: string): Tag;
    hasAttribute(attr: string): boolean;
    getAttribute<T = Attribute>(key: string): T;
    getRawAttributeValue(key: string, fallback?: any): any;
    getParsedAttributeValue(key: string, index?: number, fallback?: any): any;
    buildAttributes(): Promise<void>;
    compileAttributes(): Promise<void>;
    setupAttributes(): Promise<void>;
    extractAttributes(): Promise<void>;
    connectAttributes(): Promise<void>;
    finalize(): void;
    callOnWrapped(method: any, ...args: any[]): boolean;
    protected onclick(e: any): void;
    addClickHandler(handler: any): void;
}
