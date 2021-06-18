import {If} from "./If";

export class DisableIf extends If {
    async onChange() {
        const result: boolean = await this.tree.evaluate(this.tag.scope, this.tag.dom);
        if (result) {
            this.tag.element.setAttribute('disabled', 'disabled');
        } else {
            this.tag.element.removeAttribute('disabled')
        }
    }
}
