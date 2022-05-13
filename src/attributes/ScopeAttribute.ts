import {Attribute} from "../Attribute";
import {Registry} from "../Registry";
import {Tree} from "../AST";
import {Scope} from "../Scope";

@Registry.attribute('vsn-scope')
export class ScopeAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;
    protected tree: Tree;

    public async compile() {
        this.tree = new Tree(this.getAttributeValue());
        await this.tree.prepare(this.tag.scope, this.tag.dom, this.tag);
        await super.compile();
    }

    public async extract() {
        const value = await this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
        if (!(value instanceof Scope)) {
            throw new Error(`Scope value must be an object, got ${typeof value}`);
        }
        for (const key of value.data.keys) {
            this.tag.scope.set(key, value.data[key]);
        }
    }
}
