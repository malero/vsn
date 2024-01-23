import { Scope } from "../Scope";
import { EventDispatcher } from "../EventDispatcher";
import { Modifiers } from "../Modifiers";
export interface IEventHandler {
    event: string;
    handler: (...args: any[]) => any;
    context: any;
    state: {
        [key: string]: any;
    };
    modifiers: Modifiers;
}
export declare abstract class DOMObject extends EventDispatcher {
    readonly element: HTMLElement;
    protected _scope: Scope;
    protected onEventHandlers: {
        [key: string]: IEventHandler[];
    };
    protected onEventBindings: {
        [key: string]: (...args: any[]) => any;
    };
    protected _uniqueScope: boolean;
    protected slot: HTMLSlotElement;
    readonly delegates: HTMLElement[];
    constructor(element: HTMLElement, props: any);
    get isSlot(): boolean;
    get isSlotted(): boolean;
    get scope(): Scope;
    set scope(scope: Scope);
    watchAttribute(attr: string): Promise<any>;
    watchStyle(style: string): Promise<any>;
    deconstruct(): void;
}
