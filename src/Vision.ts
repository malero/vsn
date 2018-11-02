import {VOM} from "./VOM";
import {Scope} from "./Scope";

export class Vision {
    protected scope: Scope;
    protected vom?: VOM;

    constructor() {
        this.scope = new Scope();
        console.log('vision', this.scope);

        document.addEventListener(
            "DOMContentLoaded",
            this.setup.bind(this)
        );
    }

    setup(): void {
        console.log('document ready', this.scope);
        this.vom = new VOM(document, this.scope);
    }
}

export const vision: Vision = new Vision();
