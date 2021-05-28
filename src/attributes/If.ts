import {Attribute} from "../Attribute";
import {Tree} from "../AST";

export class If extends Attribute {
    protected tree: Tree;

    public async setup() {
        const statement: string = this.getAttributeValue();
        this.tree = new Tree(statement);
    }

    public async execute() {
        await this.evaluate();
    }

    public async evaluate() {
        this.onChange();
    }

    onChange() {
        this.tree.evaluate(this.tag.scope).then((result) => {
            if (result) {
                this.tag.show();
            } else {
                this.tag.hide();
            }
        });
    }
}
