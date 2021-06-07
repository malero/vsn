import {Attribute} from "../Attribute";
import {Tree} from "../AST";

export class Click extends Attribute {
    protected clickHandler: Tree;

    public async compile() {
        const click: string = this.getAttributeValue();
        this.clickHandler = new Tree(click);
        await this.clickHandler.prepare(this.tag.scope, this.tag.dom);
    }

    public async connect() {
        this.tag.addClickHandler(this.onClick.bind(this));
    }

    async onClick(e) {
        await this.clickHandler.evaluate(this.tag.scope, this.tag.dom);
    }
}
