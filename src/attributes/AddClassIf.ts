import {If} from "./If";
import {Registry} from "../Registry";

@Registry.attribute('vsn-add-class-if')
export class AddClassIf extends If {
    async onChange() {
        const result: boolean = await this.tree.evaluate(this.tag.scope, this.tag.dom);
        if (result) {
            this.tag.element.classList.add(this.getAttributeBinding());
        } else {
            this.tag.element.classList.remove(this.getAttributeBinding());
        }
    }
}