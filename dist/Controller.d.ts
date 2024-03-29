import { Scope } from "./Scope";
import { Tag } from "./Tag";
import { ScopeObject } from "./Scope/ScopeObject";
export declare abstract class Controller extends ScopeObject {
    protected _scope: Scope;
    protected _tag: Tag;
    protected _element: HTMLElement;
    constructor();
    get scope(): Scope;
    get tag(): Tag;
    get element(): HTMLElement;
    init(scope: Scope, tag: Tag, element: HTMLElement): void;
}
