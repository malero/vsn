import {DOM} from "./DOM";
import {EventDispatcher} from "simple-ts-event-dispatcher";

export class Vision extends EventDispatcher {
    protected dom?: DOM;
    protected controllers: {[key: string]: any} = {};

    constructor() {
        super();
        document.addEventListener(
            "DOMContentLoaded",
            this.setup.bind(this)
        );
    }

    setup(): void {
        this.dom = new DOM(document);
    }

    registerClass(cls: any) {
        const key: string = cls.prototype.constructor.name;
        this.controllers[cls.prototype.constructor.name] = cls;
        this.trigger(`registered:${key}`, cls);
    }
}

export const vision: Vision = new Vision();
window['vision'] = vision;
