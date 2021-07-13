import {Attribute} from "../Attribute";
import {Tree} from "../AST";

export class If extends Attribute {
    protected tree: Tree;

    public async compile() {
        const statement: string = this.getAttributeValue();
        this.tree = new Tree(statement);
        await this.tree.prepare(this.tag.scope, this.tag.dom);
    }

    public async extract() {
        await this.evaluate();
    }

    public async connect() {
        await this.tree.bindToScopeChanges(this.tag.scope, this.onChange.bind(this));
    }

    public async evaluate() {
        await this.onChange();
    }

    async onChange() {
        const result: boolean = await this.tree.evaluate(this.tag.scope, this.tag.dom);
        if (result) {
            this.tag.show();
        } else {
            this.tag.hide();
        }
    }
}
