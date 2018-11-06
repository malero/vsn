import {DOM} from "./DOM";

export class Vision {
    protected dom?: DOM;

    constructor() {
        document.addEventListener(
            "DOMContentLoaded",
            this.setup.bind(this)
        );
    }

    setup(): void {
        this.dom = new DOM(document);
    }
}

export const vision: Vision = new Vision();
window['vision'] = vision;
