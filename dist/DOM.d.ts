import { Tag } from "./Tag";
import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare class DOM extends EventDispatcher {
    protected document: Document;
    protected root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    constructor(document: Document, build?: boolean);
    registerElementInRoot(tag: Tag): void;
    evaluate(): void;
    mutation(mutations: MutationRecord[]): void;
    buildFrom(ele: any): Promise<void>;
    getTagForElement(element: Element): Tag;
}
