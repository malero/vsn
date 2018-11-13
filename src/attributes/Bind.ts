import {Scope, ScopeReference} from "../Scope";
import {Attribute} from "../Attribute";

export class Bind extends Attribute {
    protected key?: string;
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

    public setup(): void {
        const ref: ScopeReference = this.tag.scope.getReference(this.tag.rawAttributes['v-bind']);

        this.key = ref.key;
        this.boundScope = ref.scope;
        this.boundScope.bind(`change:${this.key}`, this.updateTo, this);

        if (!this.value)
            this.updateFrom();
        else
            this.updateTo();

        if (this.tag.isInput)
            this.tag.element.onkeyup = this.updateFrom.bind(this);
    }

    updateFrom() {
        if (this.tag.isInput) {
            this.value = (this.tag.element as any).value;
        } else {
            this.value = this.tag.element.innerText;
        }
    }

    updateTo() {
        if (this.tag.isInput) {
            (this.tag.element as any).value = this.value;
        } else {
            this.tag.element.innerText = this.value;
        }
    }
}
