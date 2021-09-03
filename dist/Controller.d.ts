import { EventDispatcher } from "simple-ts-event-dispatcher";
export declare abstract class Controller extends EventDispatcher {
    protected _tag: any;
    protected constructor();
    get tag(): any;
    set tag(tag: any);
}
