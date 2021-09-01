import {If} from "./If";
import {Registry} from "../Registry";

@Registry.attribute('vsn-disable-if')
export class DisableIf extends If {
    public static readonly canDefer: boolean = false;

    async onChange() {
        const result: boolean = await this.tree.evaluate(this.tag.scope, this.tag.dom);
        if (result) {
            this.tag.element.setAttribute('disabled', 'disabled');
        } else {
            this.tag.element.removeAttribute('disabled')
        }
    }
}
