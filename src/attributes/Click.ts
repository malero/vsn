import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {ElementHelper} from "../helpers/ElementHelper";

export class Click extends Attribute {
    protected clickHandler: Tree;

    public async setup() {
        const click: string = ElementHelper.normalizeElementID(this.getAttributeValue());
        this.clickHandler = new Tree(click);
        this.tag.addClickHandler(this.onClick.bind(this));
    }

    onClick(e) {
        this.clickHandler.evaluate(this.tag.scope);
    }
}
