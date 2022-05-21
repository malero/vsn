import {Attribute} from "../Attribute";

export class StandardAttribute extends Attribute {
    public static readonly canDefer: boolean = false;

    public async setup() {
        if (!this.tag.isMagicAttribute(this.key) && !this.tag.element.hasAttribute(this.attributeName)) {
            this.tag.element.setAttribute(this.attributeName, '');
        }
        await super.setup();
    }

    public async extract() {
        this.updateFrom();
        await super.extract();
    }

    public async connect() {
        this.tag.scope.on(`change:${this.key}`, (v) => { console.log('updated', v);});
        this.tag.scope.on(`change:${this.key}`, this.updateTo.bind(this));
        await super.connect();
    }

    public mutate(mutation: MutationRecord) {
        super.mutate(mutation);
        this.updateFrom();
    }

    public get needsToBeSynced(): boolean {
        let currentScopeValue = this.tag.scope.get(this.key) || '';
        let value = this.value;
        if (currentScopeValue && currentScopeValue.trim)
            currentScopeValue = currentScopeValue.trim();

        if (value && value.trim)
            value = value.trim();

        if (currentScopeValue instanceof Array) {
            if (!(value instanceof Array) || currentScopeValue.length !== value.length)
                return true;

            return currentScopeValue.map(v => value.indexOf(v) > -1).indexOf(false) > -1;
        }
        return currentScopeValue !== value;
    }

    public updateTo() {
        if (this.needsToBeSynced)
            this.value = this.tag.scope.get(this.key);
    }

    public updateFrom() {
        if (this.needsToBeSynced)
            this.tag.scope.set(this.key, this.value);
    }

    public get key(): string {
        return `@${this.attributeName}`;
    }

    public set value(value: any) {
        this.tag.setElementAttribute(this.tag.isMagicAttribute(this.key) ? this.key : this.attributeName, value);
    }

    public get value(): any {
        return this.tag.getElementAttribute(this.tag.isMagicAttribute(this.key) ? this.key : this.attributeName);
    }
}
