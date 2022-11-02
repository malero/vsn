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

    protected async getTree(): Promise<Tree> {
        if (!this.handler) {
            const code: string = this.getAttributeValue();
            this.handler = new Tree(code);
            await this.handler.prepare(this.tag.scope, this.tag.dom, this.tag);
        }
        return this.handler;
    }

    async handleEvent(e) {
        const tree = await this.getTree();
        await tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
    }

    public async connect() {
        this.tag.addEventHandler(this.getAttributeBinding(), this.modifiers, this.handleEvent, this);
        await super.connect();
    }
}
