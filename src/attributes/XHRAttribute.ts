import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {VisionHelper} from "../helpers/VisionHelper";
import {XHR} from "../contrib/XHR";

@Registry.attribute('vsn-xhr')
export class XHRAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    protected tree: Tree;
    protected request: XMLHttpRequest;

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
            this.tag.addEventHandler('submit', this.modifiers, this.handleEvent, this);
        } else if (this.isAnchor) {
            this.tag.addEventHandler('click', this.modifiers, this.handleEvent, this);
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
        if (this.request) return;

        this.request = new XMLHttpRequest();
        let method;
        let url;
        let formData;
        if (this.isForm) {
            url = this.tag.element.getAttribute('action');
            method = this.getAttributeBinding(this.tag.element.getAttribute('method'));
            method = method.toUpperCase();
            formData = new FormData(this.tag.element as HTMLFormElement);
            if (method == 'GET') {
                const data = {};
                const formKeys: string[] = Array.from(formData.keys());
                for (const key of formKeys) {
                    data[key] = formData.get(key);
                }
                url = VisionHelper.getUriWithParams(url, data);
                formData = null;
            }
        } else if (this.isAnchor) {
            url = this.tag.element.getAttribute('href');
            method = this.getAttributeBinding('GET');
            method = method.toUpperCase();
            if (['POST', 'PUT'].indexOf(method) > -1) {
                formData = new FormData();
            }
        }

        this.request.addEventListener('loadend', this.handleXHREvent.bind(this));
        this.request.addEventListener('error', this.handleXHREvent.bind(this));
        this.request.open(method, url);
        this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        const siteHeaders = XHR.instance.getHeaders();
        for (const key in siteHeaders) {
            this.request.setRequestHeader(key, siteHeaders[key]);
        }

        if (formData instanceof FormData) {
            const siteFormData = XHR.instance.getFormData();
            if (siteFormData) {
                for (const key in siteFormData) {
                    formData.append(key, siteFormData[key]);
                }
            }
        }

        this.request.send(formData);
    }

    public async handleXHREvent(e) {
        this.tag.scope.set('status', this.request.status);
        this.tag.scope.set('response', this.request.response);
        if (this.request.status >= 200 && this.request.status < 300) {
            await this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
            this.tag.element.dispatchEvent(new Event('xhr-success'));
        } else if (this.request.status >= 300 && this.request.status < 400) {
            this.tag.element.dispatchEvent(new Event('xhr-redirect'));
        } else if (this.request.status >= 400 && this.request.status < 500) {
            this.tag.element.dispatchEvent(new Event('xhr-client-error'));
            this.tag.element.dispatchEvent(new Event('xhr-error'));
        } else {
            this.tag.element.dispatchEvent(new Event('xhr-server-error'));
            this.tag.element.dispatchEvent(new Event('xhr-error'));
        }
        this.request = null;
    }
}
