import {Scope} from "../Scope";
import {Attribute} from "../Attribute";

export class ClassConstructor extends Attribute {
    public static readonly scoped: boolean = true;
    protected attributeKey: string;
    protected className: string;

    public async setup() {
        const parentScope: Scope = this.tag.parentTag.scope;
        if (!parentScope)
            return;

        this.attributeKey = this.getAttributeBinding();
        this.className = this.getAttributeValue();

        const cls = await window['Vision'].instance.getClass(this.className);
        this.instantiateClass(cls);

        if (this.attributeKey && parentScope)
            parentScope.set(this.attributeKey, this.tag.scope);
    }

    public async extract() {
    }

    protected instantiateClass(cls) {
        this.tag.wrap(cls);
    }
}
