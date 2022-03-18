import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {Registry} from "../Registry";

@Registry.attribute('vsn-if')
export class If extends Attribute {
    public static readonly canDefer: boolean = false;
    protected tree: Tree;

    public async compile() {
        const statement: string = this.getAttributeValue();
        this.tree = new Tree(statement);
        await this.tree.prepare(this.tag.scope, this.tag.dom, this.tag);
        await super.compile();
    }

    public async extract() {
        await this.evaluate();
        await super.extract();
    }

    public async connect() {
        await this.tree.bindToScopeChanges(this.tag.scope, this.onChange.bind(this), this.tag.dom, this.tag);
        await super.connect();
    }

    public async evaluate() {
        await this.onChange();
        await super.evaluate();
    }

    async onChange() {
        const result: boolean = await this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
        if (result) {
            this.tag.show();
        } else {
            this.tag.hide();
        }
    }
}
