import { Scope } from "./Scope";
import { Attribute } from "./Attribute";
import { EventDispatcher } from "simple-ts-event-dispatcher";
import { DOM } from "./DOM";
import { Controller } from "./Controller";
import { StandardAttribute } from "./attributes/StandardAttribute";
export declare enum TagState {
    Instantiated = 0,
    AttributesBuilt = 1,
    AttributesCompiled = 2,
    AttributesSetup = 3,
    AttributesExtracted = 4,
    AttributesConnected = 5,
    Built = 6
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
    analyzeElementAttributes(): void;
    evaluate(): Promise<void>;
    mutate(mutation: MutationRecord): void;
    get(attr: string): void;
    set(attr: string, value: any): void;
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
    watchAttribute(attributeName: string): Promise<StandardAttribute>;
}
