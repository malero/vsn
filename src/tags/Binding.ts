import {Tag} from "../Tag";
import {Scope, ScopeReference} from "../Scope";

export class Binding extends Tag {
    protected key?: string;
    protected boundScope?: Scope;

    public set value(v: any) {
        if (this.boundScope) {
            this.boundScope.set(this.key, v);
        }
    }

    public get value(): any {
        if (!this.boundScope) return null;
        return this.boundScope.get(this.key);
    }

    protected setup(): void {
        const ref: ScopeReference = this.scope.getReference(this.attributes['v-bind']);

        this.key = ref.key;
        this.boundScope = ref.scope;
        this.boundScope.bind(`change:${this.key}`, this.updateTo, this);

        if (!this.value)
            this.updateFrom();
        else
            this.updateTo();

        if (this.isInput)
            this.element.onkeyup = this.updateFrom.bind(this);
    }

    updateFrom() {
        if (this.isInput) {
            this.value = (this.element as any).value;
        } else {
            this.value = this.element.innerText;
        }
    }

    updateTo() {
        if (this.isInput) {
            (this.element as any).value = this.value;
        } else {
            this.element.innerText = this.value;
        }
    }
}
