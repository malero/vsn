import { Tag } from "./Tag";
import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare class DOM extends EventDispatcher {
    protected document: Document;
    protected root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    constructor(document: Document, build?: boolean);
    get(selector: string, create?: boolean): Promise<any>;
    registerElementInRoot(tag: Tag): void;
    evaluate(): void;
    mutation(mutations: MutationRecord[]): Promise<void>;
    buildFrom(ele: any): Promise<void>;
    getTagForElement(element: Element, create?: boolean): any;
}
