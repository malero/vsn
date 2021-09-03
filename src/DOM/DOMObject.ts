import {EventDispatcher} from "simple-ts-event-dispatcher";
import {Scope} from "../Scope";

export abstract class DOMObject extends EventDispatcher {
    protected _scope: Scope;
    protected onEventHandlers: {[key:string]:any[]};
    protected _uniqueScope: boolean = false;

    constructor(props) {
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
}
