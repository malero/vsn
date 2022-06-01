import {VisionHelper} from "../helpers/VisionHelper";
import {DOMObject} from "../DOM/DOMObject";
import {Scope} from "../Scope";

export class TagList extends Array<DOMObject> {
    constructor(...items: DOMObject[]) {
        super(...items);
        Object.setPrototypeOf(this, TagList.prototype);
    }

    get scope(): Scope {
        return this[0].scope
    }

    get elements(): HTMLElement[] {
        return this.map(e => e.element);
    }

    get first(): DOMObject {
        return this[0];
    }

    get last(): DOMObject {
        return this[this.length - 1];
    }

    all(event: string): Promise<number[]> {
        const promises = this.map(e => e.promise(event));
        return Promise.all(promises);
    }

    removeClass(className) {
        this.forEach(e => e.element.classList.remove(className))
        return this
    }

    addClass(className) {
        this.forEach(e => e.element.classList.add(className))
        return this
    }

    css(property, value) {
        const camelProp = property.replace(/(-[a-z])/, g => {
            return g.replace("-", "").toUpperCase()
        })
        this.forEach(e => (e.element.style[camelProp] = value))
        return this
    }
}

if (VisionHelper.inDevelopment && VisionHelper.window)
    window['TagList'] = TagList;
