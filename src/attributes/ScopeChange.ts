import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {ScopeReference} from "../Scope";
import {Registry} from "../Registry";

@Registry.attribute('vsn-scope-change')
export abstract class ScopeChange extends Attribute {
    protected handler: Tree;

    public async compile() {
        const code: string = this.getAttributeValue();
        this.handler = new Tree(code);
        await this.handler.prepare(this.tag.scope, this.tag.dom);
    }

    public async connect() {
        const binding = this.getAttributeBinding();
        const ref: ScopeReference = this.tag.scope.getReference(binding, false);
        ref.scope.bind(`change:${ref.key}`, this.handleEvent.bind(this));
    }

    async handleEvent(e) {
        await this.handler.evaluate(this.tag.scope, this.tag.dom);
    }
}
