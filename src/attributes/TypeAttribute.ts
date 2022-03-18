import {Attribute} from "../Attribute";
import {ScopeReference} from "../Scope";
import {Registry} from "../Registry";

@Registry.attribute('vsn-type')
export class TypeAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    public async extract() {
        const key: string = this.getAttributeBinding();
        let type: string = this.getAttributeValue();

        let ref: ScopeReference;
        try {
            ref = this.tag.scope.getReference(key);
        } catch (e) {
            console.error('error', e);
            return;
        }

        (await ref.getScope()).setType(await ref.getKey(), type);
        await super.extract();
    }
}
