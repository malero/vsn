import {Scope, ScopeReference} from "../Scope";
import {Attribute} from "../Attribute";
import {Tree} from "../AST";

export class Bind extends Attribute {
    protected key?: string;
    protected property?: string;
    protected boundScope?: Scope;

    public async compile() {
        const tree: Tree = new Tree(this.getAttributeValue());
        await tree.prepare(this.tag.scope, this.tag.dom);
    }

    public async setup() {
        this.property = this.getAttributeBinding();
    }

    public async extract() {
        let scopeKey: string = this.getAttributeValue();
        let ref: ScopeReference;
        try {
            ref = this.tag.scope.getReference(scopeKey);
        } catch (e) {
            console.error('error', e);
            return;
        }

        this.key = ref.key;
        this.boundScope = ref.scope;

        const elementValue = this.valueFromElement;
        if (!!elementValue)
            this.updateFrom();
    }

    public async connect() {
        if (this.tag.isInput) {
            //this.tag.element.onchange = this.updateFrom.bind(this);
            this.tag.element.onkeydown = this.updateFrom.bind(this);
            this.tag.element.onkeyup = this.updateFrom.bind(this);
        }
        this.updateTo();
        this.boundScope.bind(`change:${this.key}`, this.updateTo, this);
    }

    public async evaluate() {
        const elementValue = this.valueFromElement;
        if (!!elementValue)
            this.updateFrom();
        else
            this.updateTo();
    }

    public set value(v: any) {
        if (this.boundScope) {
            this.boundScope.set(this.key, v);
        }
    }

    public get value(): any {
        if (!this.boundScope) return null;
        return this.boundScope.get(this.key, false);
    }

    get valueFromElement(): string {
        let value;
        if (this.property) {
            value = this.tag.element.getAttribute(this.property);
        } else {
            if (this.tag.isInput) {
                value = (this.tag.element as any).value;
            } else {
                value = this.tag.element.textContent;
            }
        }

        return value;
    }

    public mutate(mutation: MutationRecord) {
        super.mutate(mutation);

        // Element innerText binding
        if (!this.property && [
            'characterData',
            'childList'
        ].indexOf(mutation.type) > -1)
            this.updateFrom();
        // Input value binding
        else if (!this.property && mutation.type == 'attributes' && mutation.attributeName === 'value')
            this.updateFrom();
        // Attribute binding
        else if (mutation.type === 'attributes' && mutation.attributeName == this.property)
            this.updateFrom();
    }

    updateFrom() {
        let valueFromElement = this.valueFromElement;
        valueFromElement = typeof valueFromElement === 'string' && valueFromElement.trim() || valueFromElement;
        let valueFromScope = this.value;
        valueFromScope = typeof valueFromScope === 'string' && valueFromScope.trim() || valueFromScope;

        if (!valueFromScope || valueFromElement != valueFromScope)
            this.value = valueFromElement;
    }

    updateTo() {
        if (this.property) {
            this.tag.element.setAttribute(this.property, this.value);
        } else {
            if (this.tag.isInput) {
                this.tag.element.setAttribute('value', this.value);
                (this.tag.element as any).value = this.value;
            } else {
                this.tag.element.innerText = this.value;
            }
        }
    }
}
