import {Scope} from "../Scope";
import {EventDispatcher} from "../EventDispatcher";

export abstract class DOMObject extends EventDispatcher {
    protected _scope: Scope;
    protected onEventHandlers: {[key:string]:any[]};
    protected _uniqueScope: boolean = false;

    constructor(
        public readonly element: HTMLElement,
        props
    ) {
        super();
    }

    public get scope(): Scope {
        if (!!this._scope)
            return this._scope;

        return null;
    }

    public set scope(scope: Scope) {
        this._scope = scope;
    }

    public watchAttribute(attr: string) {

    }

    public watchStyle(style: string) {

    }

    public deconstruct() {
        if (this._uniqueScope)
            this.scope?.deconstruct();
        super.deconstruct();
    }
}
