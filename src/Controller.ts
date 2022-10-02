import {Scope} from "./Scope";
import {Tag} from "./Tag";
import {ScopeObject} from "./Scope/ScopeObject";

export abstract class Controller extends ScopeObject {
    protected _scope: Scope;
    protected _tag: Tag;
    protected _element: HTMLElement;

    constructor() {
        super();
        for (const k in this) {
            if (this[k] as any instanceof Function) {
                this.__properties__.push(k);
            }
        }
    }

    public get scope(): Scope {
        return this._scope;
    }

    public get tag(): Tag {
        return this._tag;
    }

    public get element(): HTMLElement {
        return this._element;
    }

    public init(scope: Scope, tag: Tag, element: HTMLElement): void {
        this._scope = scope;
        this._tag = tag;
        this._element = element;
    }
}
