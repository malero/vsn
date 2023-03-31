import {AbstractDOM} from "./AbstractDOM";

export class ShadowDOM extends AbstractDOM {
    protected _parent: AbstractDOM;

    constructor(
        parent: AbstractDOM,
        rootElement: HTMLElement,
        build: boolean = true,
        debug: boolean = false
    ) {
        super(rootElement, build, debug);
        this._parent = parent;
    }
}
