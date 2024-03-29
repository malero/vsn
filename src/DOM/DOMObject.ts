import {Scope} from "../Scope";
import {EventDispatcher} from "../EventDispatcher";
import {Modifiers} from "../Modifiers";
import {ClassNode} from "../AST/ClassNode";
import {Tag} from "../Tag";

export interface IEventHandler {
    event: string;
    handler: (...args: any[]) => any;
    context: any;
    state: { [key: string]: any };
    modifiers: Modifiers;
    //binding: (...args: any[]) => any;
}

export abstract class DOMObject extends EventDispatcher {
    protected _scope: Scope;
    protected onEventHandlers: {[key:string]: IEventHandler[]};
    protected onEventBindings: {[key: string]: (...args: any[]) => any};
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

    public async watchAttribute(attr: string): Promise<any> {

    }

    public async watchStyle(style: string): Promise<any> {

    }

    public deconstruct() {
        if (this._uniqueScope)
            this.scope?.deconstruct();
        this.onEventHandlers = {};
        this.onEventBindings = {};
        this.slot = null;
        this.delegates.length = 0;
        if (this.element) {
            this.element[Tag.TaggedVariable] = null;
            this.element[ClassNode.ClassesVariable] = null;
        }
        super.deconstruct();
    }
}
