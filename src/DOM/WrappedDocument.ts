import {DOMObject} from "./DOMObject";

export class WrappedDocument extends DOMObject {
    constructor(
        protected _document: Document, ...props) {
        super(_document as any, props);

    }
}
