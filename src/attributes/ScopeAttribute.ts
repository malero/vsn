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
        const code = this.getAttributeValue();
        if (code) {
            this.tree = new Tree(code);
            await this.tree.prepare(this.tag.scope, this.tag.dom, this.tag);
        }
        await super.compile();
    }

    public async extract() {
        if (this.tree) {
            const binding = this.getAttributeBinding();

            const scope = await this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
            if (!(scope instanceof Scope)) {
                throw new Error(`vsn-scope value must be an object, got ${typeof scope}`);
            }

            if (binding) {
                this.tag.scope.set(binding, scope);
            } else {
                for (const key of scope.data.keys) {
                    this.tag.scope.set(key, scope.data[key]);
                }
            }
        }
        await super.extract();
    }
}
