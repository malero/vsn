import { Tag } from "./Tag";
import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare class DOM extends EventDispatcher {
    protected rootElement: Document;
    protected debug: boolean;
    protected static _instance: DOM;
    protected root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[];
    constructor(rootElement: Document, build?: boolean, debug?: boolean);
    get(selector: string, create?: boolean): Promise<Tag[]>;
    registerElementInRoot(tag: Tag): void;
    querySelectorAll(q: string): NodeList;
    querySelector(q: string): Element;
    eval(code: string): Promise<any>;
    evaluate(): Promise<void>;
    mutation(mutations: MutationRecord[]): Promise<void>;
    buildFrom(ele: any, isRoot?: boolean): Promise<void>;
    getTagForElement(element: Element, create?: boolean): any;
    static get instance(): DOM;
}
