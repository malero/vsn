import { DOMObject } from "../DOM/DOMObject";
import { Scope } from "../Scope";
export declare class TagList extends Array<DOMObject> {
    constructor(...items: DOMObject[]);
    get scope(): Scope;
    get elements(): HTMLElement[];
    get first(): DOMObject;
    get last(): DOMObject;
    all(event: string): Promise<number[]>;
    removeClass(className: any): this;
    addClass(className: any): this;
    css(property: any, value: any): this;
}
