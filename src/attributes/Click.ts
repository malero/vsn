import {Attribute} from "../Attribute";
import {Tree} from "../ast";

export class Click extends Attribute {
    protected clickHandler: Tree;

    public setup(): void {
        const click: string = this.tag.rawAttributes['v-click'];
        this.clickHandler = new Tree(click);
        this.tag.element.onclick = this.onClick.bind(this);
    }

    onClick() {
        this.clickHandler.evaluate(this.tag.scope);
    }
}
