import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {TagState} from "../Tag";


export interface IPersistedValue {
    attribute: string,
    value: string
}

@Registry.attribute('vsn-persist')
export class PersistAttribute extends Attribute {
    public static readonly persistedValues: Map<string, Map<string, string | string[]>> = new Map<string, Map<string, string | string[]>>();
    public static readonly canDefer: boolean = true;

    protected valueKeys: string[] = [];

    public async extract() {
        this.valueKeys = this.getAttributeValue().split(' ').map((v: string) => v.trim()).filter((v: string) => v.length > 0);
        await super.extract();
    }

    public async connect() {
        const elementId = this.tag.element.id;

        if (!elementId)
            throw new Error('vsn-persist requires an id attribute on the element');

        const persistedValues = PersistAttribute.getPersistedValueStore(elementId);
        for (const key of this.valueKeys) {
            if (persistedValues.has(key)) {
                if (key === '@class') {
                    const classes = persistedValues.get(key);
                    this.tag.element.classList.remove(...Array.from(this.tag.element.classList));
                    this.tag.element.classList.add(...classes);
                } else if (key.startsWith('@')) {
                    this.tag.element.setAttribute(key.substring(1), persistedValues.get(key) as string);
                    if (this.tag.isInput) {
                        this.tag.once('$built', () => {
                            this.tag.element.dispatchEvent(new Event('input'));
                        });
                    }
                } else {

                }
            }
        }
        await super.connect();
    }

    public mutate(mutation: MutationRecord) {
        if (this.tag.state !== TagState.Built)
            return;

        this.updateFrom();
    }

    protected updateFrom() {
        const elementId = this.tag.element.id;
        const persistedValues = PersistAttribute.getPersistedValueStore(elementId);

        for (const key of this.valueKeys) {
            if (key === '@class') {
                const classes = Array.from(this.tag.element.classList);
                persistedValues.set(key, classes);
            } else if (key.startsWith('@')) {
                persistedValues.set(key, this.tag.element.getAttribute(key.substring(1)));
                if (this.tag.isInput) {
                    this.tag.dispatch('input');
                }
            } else {

            }
        }
    }

    public static getPersistedValueStore(elementId: string) {
        if (!PersistAttribute.persistedValues.has(elementId))
            PersistAttribute.persistedValues.set(elementId, new Map<string, string>());

        return PersistAttribute.persistedValues.get(elementId);
    }
}
