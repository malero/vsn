import {Attribute} from "../Attribute";
import {Tree} from "../AST";

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
        'unload',
    ];

    public async compile() {
        const code: string = this.getAttributeValue();
        this.handler = new Tree(code);
        await this.handler.prepare(this.tag.scope, this.tag.dom);
    }

    async handleEvent(e) {
        await this.handler.evaluate(this.tag.scope, this.tag.dom);
    }

    public async connect() {
        this.tag.addEventHandler(this.getAttributeBinding(), this.getAttributeModifiers(), this.handleEvent.bind(this));
    }
}
