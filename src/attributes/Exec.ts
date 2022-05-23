import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {Registry} from "../Registry";

@Registry.attribute('vsn-exec')
export class Exec extends Attribute {
    public static readonly canDefer: boolean = false;
    protected tree: Tree;

    public get code() {
        return this.getAttributeValue();
    }

    public async compile() {
        this.tree = new Tree(this.code);
        await this.tree.prepare(this.tag.scope, this.tag.dom, this.tag);
        await super.compile();
    }

    public async extract() {
        await this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
        await super.extract();
    }
}
