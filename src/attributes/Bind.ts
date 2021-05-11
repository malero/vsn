import {Scope, ScopeReference} from "../Scope";
import {Attribute} from "../Attribute";

export class Bind extends Attribute {
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
        this.property = this.getAttributeValue('v-bind');
        let scopeKey: string = this.getAttributeValue('v-bind', 1);
        let ref: ScopeReference;

        try {
            ref = this.tag.scope.getReference(scopeKey);
        } catch (e) {
            console.log('error', e);
            return;
        }
        this.key = ref.key;
        this.boundScope = ref.scope;
        this.boundScope.bind(`change:${this.key}`, this.updateTo, this);

        if (this.tag.isInput) {
            this.tag.element.onkeydown = this.updateFrom.bind(this);
            this.tag.element.onkeyup = this.updateFrom.bind(this);
        }
    }

    public async execute() {
        if (!this.value)
            this.updateFrom();
        else
            this.updateTo();
    }

    updateFrom() {
        if (this.property) {
            this.value = this.tag.element.getAttribute(this.property);
        } else {
            if (this.tag.isInput) {
                this.value = (this.tag.element as any).value;
            } else {
                this.value = this.tag.element.innerText;
            }
        }
    }

    updateTo() {
        if (this.property) {
            this.tag.element.setAttribute(this.property, this.value);
        } else {
            if (this.tag.isInput) {
                (this.tag.element as any).value = this.value;
            } else {
                this.tag.element.innerText = this.value;
            }
        }
    }
}
