import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Tree} from "../AST";

@Registry.attribute('vsn-xhr')
export class XHRAttribute extends Attribute {
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

    public async connect() {
        if (this.isForm) {
            this.tag.addEventHandler('submit', this.getAttributeModifiers(), this.handleEvent, this);
        } else if (this.isAnchor) {
            this.tag.addEventHandler('click', this.getAttributeModifiers(), this.handleEvent, this);
        }
        await super.connect();
    }

    public get isForm() {
        return this.tag.element.tagName === 'FORM';
    }

    public get isAnchor() {
        return this.tag.element.tagName === 'A';
    }

    public async handleEvent(e) {
        e.preventDefault();
        const request = new XMLHttpRequest();
        let method;
        let url;
        let data;
        if (this.isForm) {
            url = this.tag.element.getAttribute('action');
            method = this.getAttributeBinding(this.tag.element.getAttribute('method'));
            data = new FormData(this.tag.element as HTMLFormElement);
        } else if (this.isAnchor) {
            url = this.tag.element.getAttribute('href');
            method = this.getAttributeBinding('GET');
        }

        request.onload = async () => {
            this.tag.scope.set('status', request.status);
            if (request.status >= 200 && request.status < 300) {
                this.tag.scope.set('response', request.response);
                await this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
            } else {
                console.error(request.statusText);
            }
        }
        request.open(method, url);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.send(data);

        await this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
    }
}
