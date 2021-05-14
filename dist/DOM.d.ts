import { Tag } from "./Tag";
import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare class DOM extends EventDispatcher {
    protected document: Document;
    protected tags: Tag[];
    protected observer: MutationObserver;
    constructor(document: Document, build?: boolean);
    mutation(mutations: MutationRecord[]): void;
    buildFrom(ele: any): Promise<void>;
    getTagForElement(element: Element): Tag;
}
