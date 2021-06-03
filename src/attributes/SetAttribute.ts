import {Scope, ScopeReference} from "../Scope";
import {Attribute} from "../Attribute";

export class SetAttribute extends Attribute {
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
        this.key = ref.key;
        this.boundScope = ref.scope;
    }

    public async extract() {
        this.boundScope.set(this.key, this.getAttributeValue(null));
    }
}
