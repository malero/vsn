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
        let value = this.getAttributeValue(null);
        const typeIndex: number = value.indexOf('|');
        if (typeIndex > -1) {
            this.boundScope.setType(this.key, this.boundScope.stringToType(value.substr(typeIndex + 1)));
            value = value.substr(0, typeIndex);
        }
        this.boundScope.set(this.key, value);
    }
}
