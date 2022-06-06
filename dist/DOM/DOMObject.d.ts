import { Scope } from "../Scope";
import { EventDispatcher } from "../EventDispatcher";
export interface IEventHandler {
    event: string;
    handler: (...args: any[]) => any;
    context?: any;
}
export declare abstract class DOMObject extends EventDispatcher {
    readonly element: HTMLElement;
    protected _scope: Scope;
    protected onEventHandlers: {
        [key: string]: IEventHandler[];
    };
    protected _uniqueScope: boolean;
    protected slot: HTMLSlotElement;
    readonly delegates: HTMLElement[];
    constructor(element: HTMLElement, props: any);
    get isSlot(): boolean;
    get scope(): Scope;
    set scope(scope: Scope);
    watchAttribute(attr: string): void;
    watchStyle(style: string): void;
    deconstruct(): void;
}
