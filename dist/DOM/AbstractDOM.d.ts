import { Tag } from "../Tag";
import { WrappedWindow } from "./WrappedWindow";
import { WrappedDocument } from "./WrappedDocument";
import { TagList } from "../Tag/TagList";
import { Scope } from "../Scope";
import { EventDispatcher } from "../EventDispatcher";
export declare enum EQuerySelectDirection {
    ALL = 0,
    UP = 1,
    DOWN = 2
}
export declare abstract class AbstractDOM extends EventDispatcher {
    protected rootElement: HTMLElement;
    protected debug: boolean;
    protected _root: Tag;
    protected _ready: Promise<boolean>;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[];
    protected window: WrappedWindow;
    protected document: WrappedDocument;
    protected _built: boolean;
    constructor(rootElement: HTMLElement, build?: boolean, debug?: boolean);
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
    exec(code: string, data?: object): any;
    evaluate(): Promise<void>;
    getTagsFromParent(parent: Node, includeParent?: boolean): Tag[];
    mutation(mutations: MutationRecord[]): Promise<void>;
    discover(ele: HTMLElement, forComponent?: boolean): Promise<HTMLElement[]>;
    buildTag<T = Tag>(element: HTMLElement, returnExisting?: boolean, cls?: any): Promise<T>;
    setupTags(tags: Tag[]): Promise<void>;
    buildFrom(ele: any, isRoot?: boolean, forComponent?: boolean): Promise<Tag[]>;
    getTagsForElements(elements: Element[], create?: boolean): Promise<TagList>;
    getTagForElement(element: Element, create?: boolean, forComponent?: boolean): any;
    getTagForScope(scope: Scope): Promise<Tag>;
    resetBranch(e: Tag | HTMLElement): Promise<void>;
    static getParentElement(element: HTMLElement): HTMLElement;
}
