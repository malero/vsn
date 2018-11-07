import {DOM} from "./DOM";
import {tokenize} from "./lang/Lexer";

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

    parse(str: string) {
        return tokenize(str);
    }
}

export const vision: Vision = new Vision();
window['vision'] = vision;
