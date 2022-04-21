import { Scope } from "../Scope";
import { EventDispatcher } from "../EventDispatcher";
export declare abstract class DOMObject extends EventDispatcher {
    readonly element: HTMLElement;
    protected _scope: Scope;
    protected onEventHandlers: {
        [key: string]: any[];
    };
    protected _uniqueScope: boolean;
    constructor(element: HTMLElement, props: any);
    get scope(): Scope;
    set scope(scope: Scope);
    watchAttribute(attr: string): void;
    watchStyle(style: string): void;
}
