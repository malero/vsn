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
        await this.tree.bindToScopeChanges(this.tag.scope, this.onChange.bind(this));
    }

    public async evaluate() {
        await this.onChange();
    }

    async onChange() {
        const result: boolean = await this.tree.evaluate(this.tag.scope);
        if (result) {
            this.tag.show();
        } else {
            this.tag.hide();
        }
    }
}
