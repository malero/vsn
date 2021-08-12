import { Tag } from "./Tag";
import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare class DOM extends EventDispatcher {
    protected document: Document;
    protected debug: boolean;
    protected static _instance: DOM;
    protected root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[];
    constructor(document: Document, build?: boolean, debug?: boolean);
    get(selector: string, create?: boolean): Promise<any>;
    registerElementInRoot(tag: Tag): void;
    eval(code: string): Promise<any>;
    evaluate(): Promise<void>;
    mutation(mutations: MutationRecord[]): Promise<void>;
    buildFrom(ele: any, isRoot?: boolean): Promise<void>;
    getTagForElement(element: Element, create?: boolean): any;
    static get instance(): DOM;
}
