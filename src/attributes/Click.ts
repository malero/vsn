import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {ElementHelper} from "../helpers/ElementHelper";

export class Click extends Attribute {
    protected clickHandler: Tree;

    public async compile() {
        const click: string = ElementHelper.normalizeElementID(this.getAttributeValue());
        this.clickHandler = new Tree(click);
    }

    public async connect() {
        this.tag.addClickHandler(this.onClick.bind(this));
    }

    async onClick(e) {
        await this.clickHandler.evaluate(this.tag.scope);
    }
}
