import {Scope} from "../Scope";
import {EventDispatcher} from "../EventDispatcher";

export interface IEventHandler {
    event: string;
    handler: (...args: any[]) => any;
    context?: any;
}

export abstract class DOMObject extends EventDispatcher {
    protected _scope: Scope;
    protected onEventHandlers: {[key:string]: IEventHandler[]};
    protected _uniqueScope: boolean = false;
    protected slot: HTMLSlotElement;
    public readonly delegates: HTMLElement[] = [];

    constructor(
        public readonly element: HTMLElement,
        props
    ) {
        super();
        if (this.isSlot) {
            this.delegates.push(...(element as HTMLSlotElement).assignedNodes() as HTMLElement[]);
        }
        if (element.assignedSlot) {
            this.slot = element.assignedSlot;
        }
    }

    public get isSlot(): boolean {
        return this.element instanceof HTMLSlotElement;
    }

    public get isSlotted(): boolean {
        return this.element.hasAttribute('slot');
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
