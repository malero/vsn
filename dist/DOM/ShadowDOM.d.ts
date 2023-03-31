import { AbstractDOM } from "./AbstractDOM";
export declare class ShadowDOM extends AbstractDOM {
    protected _parent: AbstractDOM;
    constructor(parent: AbstractDOM, rootElement: HTMLElement, build?: boolean, debug?: boolean);
}
