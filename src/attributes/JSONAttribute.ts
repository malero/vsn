import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Scope} from "../Scope";
import {ScopeReference} from "../Scope/ScopeReference";

@Registry.attribute('vsn-json')
export class JSONAttribute extends Attribute {
    public static readonly canDefer: boolean = false;

    public async extract() {
        let scopeKey: string = this.getAttributeBinding();
        let ref: ScopeReference;
        try {
            ref = this.tag.scope.getReference(scopeKey);
        } catch (e) {
            console.error('error', e);
            return;
        }

        const key = await ref.getKey();
        const scope = await ref.getScope();

        let json;
        if (this.tag.element.tagName.toLowerCase() === 'script') {
            json = this.tag.element.innerText;
        } else {
            json = unescape(this.getAttributeValue());
        }
        const property = this.getAttributeBinding();
        const data = JSON.parse(json);
        if (data && typeof data === 'object' && data.constructor === Object) {
            const newScope = new Scope(scope);
            newScope.wrap(data);
            scope.set(key, newScope);
        }

        scope.set(key, data);
        await super.extract();
    }
}
