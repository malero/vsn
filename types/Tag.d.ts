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
    readonly deferredAttributes: Attribute[];
    protected _state: TagState;
    protected attributes: Attribute[];
    protected _nonDeferredAttributes: Attribute[];
    protected _parentTag: Tag;
    protected _children: Tag[];
    protected _scope: Scope;
    protected _controller: Controller;
    protected inputTags: string[];
    protected onEventHandlers: {
        [key: string]: any[];
    };
    private _uniqueScope;
    get uniqueScope(): boolean;
    constructor(element: HTMLElement, dom: DOM);
    protected onAttributeStateChange(event: any): void;
    get nonDeferredAttributes(): Attribute[];
    get style(): CSSStyleDeclaration;
    get computedStyle(): CSSStyleDeclaration;
    analyzeElementAttributes(): void;
    evaluate(): Promise<void>;
    mutate(mutation: MutationRecord): void;
    get(attr: string): void;
    set(attr: string, value: any): void;
    getAttributeClass(attr: string): Promise<any>;
    getAttributeName(attr: string): string;
    getAttributeBinding(attr: string): string;
    getAttributeModifiers(attr: string): string[];
    get isInput(): boolean;
    set value(value: string);
    get value(): string;
    addChild(tag: Tag): void;
    get children(): Tag[];
    get parentTag(): Tag;
    set parentTag(tag: Tag);
    get scope(): Scope;
    set scope(scope: Scope);
    get controller(): Controller;
    set controller(controller: Controller);
    wrap(obj: any, triggerUpdates?: boolean, updateFromWrapped?: boolean): any;
    unwrap(): void;
    removeFromDOM(): void;
    addToParentElement(): void;
    hide(): void;
    show(): void;
    findAncestorByAttribute(attr: string): Tag;
    hasAttribute(attr: string): boolean;
    getAttribute<T = Attribute>(key: string): Promise<T>;
    getRawAttributeValue(key: string, fallback?: any): any;
    getParsedAttributeValue(key: string, index?: number, fallback?: any): any;
    buildAttributes(): Promise<void>;
    compileAttributes(): Promise<void>;
    setupAttributes(): Promise<void>;
    extractAttributes(): Promise<void>;
    connectAttributes(): Promise<void>;
    inputMutation(e: any): void;
    finalize(): void;
    callOnWrapped(method: any, ...args: any[]): boolean;
    protected handleEvent(eventType: string, e: any): void;
    hasModifier(attribute: string, modifier: string): boolean;
    stripModifier(attribute: string, modifier: string): string;
    addEventHandler(eventType: string, modifiers: string[], handler: any): void;
    watchAttribute(attributeName: string): Promise<StandardAttribute>;
    private setupAttribute;
    private setupDeferredAttributes;
}
