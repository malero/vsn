import {Attribute} from "../Attribute";
import {DOM} from "../DOM";

export class StandardAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    protected static readonly magicAttributes: string[] = [
        '@text',
        '@html',
        '@class',
        '@value'
    ];

    public async setup() {
        if (StandardAttribute.magicAttributes.indexOf(this.key) === -1 && !this.tag.element.hasAttribute(this.attributeName)) {
            this.tag.element.setAttribute(this.attributeName, '');
        }
        await super.setup();
    }

    public async extract() {
        this.updateFrom();
        await super.extract();
    }

    public async connect() {
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
            this.value = this.tag.scope.get(`@${this.attributeName}`);
    }

    public updateFrom() {
        if (this.needsToBeSynced)
            this.tag.scope.set(this.key, this.value);
    }

    public get key(): string {
        return `@${this.attributeName}`;
    }

    public set value(value: any) {
        if (this.key === '@text')
            this.tag.element.innerText = value;
        else if (this.key === '@html') {
            this.tag.element.innerHTML = value;
            DOM.instance.buildFrom(this.tag.element);
        } else if (this.key === '@value')
            this.tag.value = value;
        else if (this.key === '@class' && value) {
            this.tag.element.classList.remove(...Array.from(this.tag.element.classList));
            const classes: string[] = value instanceof Array ? value : [value];
            if (classes.length)
                this.tag.element.classList.add(...classes);
        }
        else
            this.tag.element.setAttribute(this.attributeName, value);
    }

    public get value(): any {
        if (this.key === '@text')
            return this.tag.element.innerText;
        else if (this.key === '@html')
            return this.tag.element.innerHTML;
        else if (this.key === '@value')
            return this.tag.value;
        else if (this.key === '@class') {
            return Array.from(this.tag.element.classList);
        } else
            return this.tag.element.getAttribute(this.attributeName);
    }
}
