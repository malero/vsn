import { Tag } from "./Tag";
import { TagList } from "./Tag/List";
import { WrappedWindow } from "./DOM/WrappedWindow";
import { WrappedDocument } from "./DOM/WrappedDocument";
import { Scope } from "./Scope";
import { EventDispatcher } from "./EventDispatcher";
export declare enum EQuerySelectDirection {
    ALL = 0,
    UP = 1,
    DOWN = 2
}
export declare class DOM extends EventDispatcher {
    protected rootElement: Document;
    protected debug: boolean;
    protected static _instance: DOM;
    protected _root: Tag;
    protected _ready: Promise<boolean>;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[];
    protected window: WrappedWindow;
    protected document: WrappedDocument;
    protected _built: boolean;
    selected: Tag;
    constructor(rootElement: Document, build?: boolean, debug?: boolean);
    get built(): boolean;
    get root(): Tag;
    get ready(): Promise<boolean>;
    get(selector: string, create?: boolean, tag?: Tag, direction?: EQuerySelectDirection): Promise<TagList>;
    getFromTag(tag: Tag, selector: string, create?: boolean): Promise<TagList>;
    registerElementInRoot(tag: Tag): void;
    querySelectorClosest(q: string, tag?: Tag): HTMLElement;
    querySelectPath(path: string[], element?: HTMLElement): HTMLElement[];
    querySelectorAll(q: string, tag?: Tag): NodeList | HTMLElement[];
    querySelectorElement(element: HTMLElement | Document, q: string): NodeList | HTMLElement[];
    querySelector(q: string): Element;
    exec(code: string): Promise<any>;
    evaluate(): Promise<void>;
    mutation(mutations: MutationRecord[]): Promise<void>;
    discover(ele: HTMLElement, forComponent?: boolean): Promise<HTMLElement[]>;
    buildTag(element: HTMLElement, returnExisting?: boolean): Promise<Tag>;
    buildFrom(ele: any, isRoot?: boolean, forComponent?: boolean): Promise<void>;
    getTagsForElements(elements: Element[], create?: boolean): Promise<TagList>;
    getTagForElement(element: Element, create?: boolean, forComponent?: boolean): any;
    getTagForScope(scope: Scope): Promise<Tag>;
    static get instance(): DOM;
}
