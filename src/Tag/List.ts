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

    on(event, cbOrSelector, cb) {
        if (typeof cbOrSelector === "function") {
            this.forEach(e => e.element.addEventListener(event, cbOrSelector))
        } else {
            this.forEach(elem => {
                elem.element.addEventListener(event, e => {
                    if (e.target.matches(cbOrSelector)) cb(e)
                })
            })
        }
        return this
    }

    get elements(): HTMLElement[] {
        return this.map(e => e.element);
    }

    next() {
        return this.map(e => e.element.nextElementSibling).filter(e => e != null)
    }

    prev() {
        return this.map(e => e.element.previousElementSibling).filter(e => e != null)
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
