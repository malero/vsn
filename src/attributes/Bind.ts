import {Scope, ScopeReference} from "../Scope";
import {Attribute} from "../Attribute";
import {Tree} from "../AST";
import {Registry} from "../Registry";
import {benchmark} from "../Bencmark";

@Registry.attribute('vsn-bind')
export class Bind extends Attribute {
    protected key?: string;
    protected property?: string;
    protected direction: string = 'both';
    protected boundScope?: Scope;
    protected formatter: (v: string) => string = (v) => v;

    @benchmark('Attribute', ['Bind', 'compile'])
    public async compile() {
        const tree: Tree = new Tree(this.getAttributeValue());
        await tree.prepare(this.tag.scope, this.tag.dom);
    }

    @benchmark('attributeSetup', 'Bind')
    public async setup() {
        this.property = this.getAttributeBinding();
        const mods = this.getAttributeModifiers();
        if (mods.length) {
            if (mods.indexOf('from') > -1) {
                this.direction = 'from';
            } else if (mods.indexOf('to') > -1) {
                this.direction = 'to';
            }
        }
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

        if (!!this.valueFromElement)
            this.updateFrom();
    }

    public async connect() {
        if (this.doUpdateTo) {
            this.updateTo();
            this.boundScope.bind(`change:${this.key}`, this.updateTo, this);
        }
    }

    public async evaluate() {
        const elementValue = this.valueFromElement;
        if (!!elementValue)
            this.updateFrom();
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
            value = this.tag.value;
        }

        return value;
    }

    public mutate(mutation: MutationRecord) {
        super.mutate(mutation);

        if (!this.doUpdateFrom) return;

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

    public get doUpdateFrom(): boolean {
        return ['both', 'to'].indexOf(this.direction) > -1;
    }

    updateFrom() {
        if (!this.doUpdateFrom) return;
        let valueFromElement = this.valueFromElement;
        valueFromElement = typeof valueFromElement === 'string' && valueFromElement.trim() || valueFromElement;
        let valueFromScope = this.value;
        valueFromScope = typeof valueFromScope === 'string' && valueFromScope.trim() || valueFromScope;
        valueFromScope = this.formatter(valueFromScope); // Apply format for comparison

        if (!valueFromScope || valueFromElement != valueFromScope)
            this.value = valueFromElement;
    }

    public get doUpdateTo(): boolean {
        return ['both', 'from'].indexOf(this.direction) > -1;
    }

    updateTo() {
        if (!this.doUpdateTo) return;
        const value = this.formatter(this.value);
        if (this.property) {
            this.tag.element.setAttribute(this.property, value);
        } else {
            this.tag.value = value;
        }
    }

    setFormatter(formatter) {
        this.formatter = formatter;
    }
}
