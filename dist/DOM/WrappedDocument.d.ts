import { DOMObject } from "./DOMObject";
export declare class WrappedDocument extends DOMObject {
    protected _document: Document;
    constructor(_document: Document, ...props: any[]);
}
