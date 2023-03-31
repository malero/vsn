import { ShadowDOM } from "./DOM/ShadowDOM";
export declare class Component extends HTMLElement {
    protected readonly shadow: ShadowRoot;
    protected readonly shadowDOM: ShadowDOM;
    constructor();
    connectedCallback(): Promise<void>;
}
