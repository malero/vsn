import { Tag } from "./Tag";
export declare class DOM {
    protected document: Document;
    protected tags: Tag[];
    constructor(document: Document);
    buildFrom(ele: any): void;
    getTagForElement(element: Element): Tag;
}
