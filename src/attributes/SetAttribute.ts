import {Scope, ScopeReference} from "../Scope";
import {Attribute} from "../Attribute";
import {Registry} from "../Registry";

@Registry.attribute('vsn-set')
export class SetAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    protected key?: string;
    protected property?: string;
    protected boundScope?: Scope;

    public set value(v: any) {
        if (this.boundScope) {
            this.boundScope.set(this.key, v);
        }
    }

    public get value(): any {
        if (!this.boundScope) return null;
        return this.boundScope.get(this.key, false);
    }

    public async setup() {
        this.property = this.getAttributeBinding();
        let ref: ScopeReference;
        try {
            ref = this.tag.scope.getReference(this.property);
        } catch (e) {
            return;
        }
        this.key = await ref.getKey();
        this.boundScope = await ref.getScope();
    }

    public async extract() {
        let value = this.getAttributeValue(null);
        const typeIndex: number = value && value.indexOf('|') || -1;
        if (typeIndex > -1) {
            this.boundScope.setType(this.key, value.substr(typeIndex + 1));
            value = value.substr(0, typeIndex);
        }
        this.boundScope.set(this.key, value);
    }
}
