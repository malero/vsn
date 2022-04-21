import { EventDispatcher } from "simple-ts-event-dispatcher";
import { Scope } from "./Scope";
import { Tag } from "./Tag";
export declare abstract class Controller extends EventDispatcher {
    protected _scope: Scope;
    protected _tag: Tag;
    protected _element: HTMLElement;
    get scope(): Scope;
    get tag(): Tag;
    get element(): HTMLElement;
    init(scope: Scope, tag: Tag, element: HTMLElement): void;
}
