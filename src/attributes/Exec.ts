import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {Registry} from "../Registry";
import {benchmark} from "../Bencmark";

@Registry.attribute('vsn-exec')
export class Exec extends Attribute {
    protected tree: Tree;

    @benchmark('DOM', ['attribute', 'exec', 'compile'])
    public async compile() {
        this.tree = new Tree(this.getAttributeValue());
        await this.tree.prepare(this.tag.scope, this.tag.dom);
    }

    public async extract() {
        await this.tree.evaluate(this.tag.scope, this.tag.dom);
    }
}
