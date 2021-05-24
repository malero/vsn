import {Attribute} from "../Attribute";
import {Tree} from "../AST";

export class Click extends Attribute {
    protected clickHandler: Tree;

    public async setup() {
        const click: string = this.getAttributeValue();
        this.clickHandler = new Tree(click);
        this.tag.addClickHandler(this.onClick.bind(this));
    }

    onClick(e) {
        this.clickHandler.evaluate(this.tag.scope);
    }
}
