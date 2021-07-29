import {Attribute} from "../Attribute";


export class StandardAttribute extends Attribute {
    protected readonly magicAttributes: string[] = [
        '@text',
        '@html'
    ]
    public async setup() {
        if (this.magicAttributes.indexOf(this.key) === -1 && !this.tag.element.hasAttribute(this.attributeName)) {
            this.tag.element.setAttribute(this.attributeName, '');
        }
    }

    public async extract() {
        this.updateFrom();
    }

    public async connect() {
        this.tag.scope.bind(`change:${this.key}`, this.updateTo.bind(this));
    }

    public mutate(mutation: MutationRecord) {
        super.mutate(mutation);
        this.updateFrom();
    }

    public get needsToBeSynced(): boolean {
        const currentScopeValue = this.tag.scope.get(this.key) || '';
        return currentScopeValue.trim() !== this.value.trim();
    }

    public updateTo() {
        if (this.needsToBeSynced)
            this.value = this.tag.scope.get(`@${this.attributeName}`);
    }

    public updateFrom() {
        if (this.needsToBeSynced)
            this.tag.scope.set(this.key, this.value);
    }

    public get key(): string {
        return `@${this.attributeName}`;
    }

    public set value(value: string) {
        if (this.key === '@text')
            this.tag.element.innerText = value;
        else if (this.key === '@html')
            this.tag.element.innerHTML = value;
        else
            this.tag.element.setAttribute(this.attributeName, value);
    }

    public get value(): string {
        if (this.key === '@text')
            return this.tag.element.innerText;
        else if (this.key === '@html')
            return this.tag.element.innerHTML;
        else
            return this.tag.element.getAttribute(this.attributeName);
    }
}
