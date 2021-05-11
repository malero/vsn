import {EventDispatcher} from "simple-ts-event-dispatcher";

export abstract class Controller extends EventDispatcher {
    protected _tag: any;

    protected constructor() {
        super();
    }

    public get tag(): any {
        return this._tag;
    }

    public set tag(tag: any) {
        this._tag = tag;
        this.trigger('tag', tag);
    }
}
