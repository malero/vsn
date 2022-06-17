import {Scope} from "../Scope";
import {Attribute} from "../Attribute";
import {Registry} from "../Registry";
import {ScopeReference} from "../Scope/ScopeReference";

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

    public async extract() {
        this.property = this.getAttributeBinding();
        let ref: ScopeReference;
        try {
            ref = this.tag.scope.getReference(this.property);
        } catch (e) {
            return;
        }
        this.key = await ref.getKey();
        this.boundScope = await ref.getScope();
        let value = this.getAttributeValue(null);
        for (const m of this.getAttributeModifiers()) {
            const t = Registry.instance.types.getSynchronous(m);
            if (t) {
                this.boundScope.setType(this.key, m);
                break;
            }
        }
        this.boundScope.set(this.key, value);
    }
}
