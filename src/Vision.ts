import {DOM} from "./DOM";
import {Tree} from "./ast";
import {Scope} from "./Scope";

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
        const scope: Scope = new Scope();
        scope.set('test', {
            testing: 'Worky?'
        });
        scope.set('func', () => {
            console.log('called func');
            return 'testing';
        });
        const t = new Tree(str);
        return t.evaluate(scope);
    }
}

export const vision: Vision = new Vision();
window['vision'] = vision;
