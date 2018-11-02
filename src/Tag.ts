import {Scope} from "./Scope";

export abstract class Tag {
    protected attributes: { [key: string]: string; };
    protected inputTags: string[] = [
        'input',
        'select',
        'textarea'
    ];

    constructor(
        protected readonly element: HTMLElement,
        protected readonly scope: Scope
    ) {
        this.parseAttributes();
        this.setup();
    }

    parseAttributes() {
        this.attributes = {};
        for (let i: number = 0; i < this.element.attributes.length; i++) {
            const a = this.element.attributes[i];
            if (a.name.substr(0, 2) == 'v-') {
                this.attributes[a.name] = a.value;
            }
        }
    }

    get isInput(): boolean {
        return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
    }

    protected abstract setup(): void;
}
