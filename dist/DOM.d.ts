import { Tag } from "./Tag";
import { EventDispatcher } from "simple-ts-event-dispatcher";
import { TagList } from "./Tag/List";
import { WrappedWindow } from "./DOM/WrappedWindow";
import { WrappedDocument } from "./DOM/WrappedDocument";
import { Scope } from "./Scope";
export declare class DOM extends EventDispatcher {
    protected rootElement: Document;
    protected debug: boolean;
    protected static _instance: DOM;
    protected root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[];
    protected window: WrappedWindow;
    protected document: WrappedDocument;
    selected: Tag;
    constructor(rootElement: Document, build?: boolean, debug?: boolean);
    get(selector: string, create?: boolean, tag?: Tag): Promise<TagList>;
    getFromTag(tag: Tag, selector: string, create?: boolean): Promise<TagList>;
    registerElementInRoot(tag: Tag): void;
    querySelectorAll(q: string, tag?: Tag): NodeList | HTMLElement[];
    querySelectorElement(element: HTMLElement | Document, q: string): NodeList | HTMLElement[];
    querySelector(q: string): Element;
    eval(code: string): Promise<any>;
    evaluate(): Promise<void>;
    mutation(mutations: MutationRecord[]): Promise<void>;
    buildFrom(ele: any, isRoot?: boolean): Promise<void>;
    getTagsForElements(elements: Element[], create?: boolean): Promise<TagList>;
    getTagForElement(element: Element, create?: boolean): any;
    getTagForScope(scope: Scope): Promise<Tag>;
    static get instance(): DOM;
}