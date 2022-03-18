import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {Registry} from "../Registry";

@Registry.attribute('vsn-on')
export abstract class On extends Attribute {
    protected handler: Tree;
    public static readonly WindowEvents: string[] = [
        'abort',
        'afterprint',
        'beforeprint',
        'error',
        'hashchange',
        'load',
        'popstate',
        'resize',
        'scroll',
        'unload',
    ];

    public async compile() {
        const code: string = this.getAttributeValue();
        this.handler = new Tree(code);
        await this.handler.prepare(this.tag.scope, this.tag.dom, this.tag);
        await super.compile();
    }

    async handleEvent(e) {
        if (this.hasModifier('preventdefault'))
            e.preventDefault();
        await this.handler.evaluate(this.tag.scope, this.tag.dom, this.tag);
    }

    public async connect() {
        this.tag.addEventHandler(this.getAttributeBinding(), this.getAttributeModifiers(), this.handleEvent.bind(this));
        await super.connect();
    }
}
