import { EventDispatcher } from "simple-ts-event-dispatcher";
import { Scope } from "../Scope";
export declare abstract class DOMObject extends EventDispatcher {
    protected _scope: Scope;
    protected onEventHandlers: {
        [key: string]: any[];
    };
    protected _uniqueScope: boolean;
    constructor(props: any);
    get scope(): Scope;
    set scope(scope: Scope);
    watchAttribute(attr: string): void;
}
