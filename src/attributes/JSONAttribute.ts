import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Scope} from "../Scope";

@Registry.attribute('vsn-json')
export class JSONAttribute extends Attribute {
    public static readonly canDefer: boolean = false;

    public async extract() {
        let json;
        if (this.tag.element.tagName.toLowerCase() === 'script') {
            json = this.tag.element.innerText;
        } else {
            json = unescape(this.getAttributeValue());
        }
        const property = this.getAttributeBinding();
        const data = JSON.parse(json);
        if (data instanceof Array) {
            this.tag.scope.set(property, data);
        } else {
            const scope = new Scope(this.tag.scope);
            scope.wrap(data);
            this.tag.scope.set(property, scope);
        }
    }
}
