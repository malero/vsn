import {Scope} from "../Scope";
import {Attribute} from "../Attribute";
import {IPromise} from "simple-ts-promise";

export class ClassConstructor extends Attribute {
    public static readonly scoped: boolean = true;
    protected attributeKey: string;
    protected className: string;

    public async setup() {
        const parentScope: Scope = this.tag.parent.scope;
        if (!parentScope)
            return;

        this.attributeKey = this.getAttributeBinding();
        this.className = this.getAttributeValue();

        const cls = await window['Vision'].instance.getClass(this.className);
        this.instantiateClass(cls);

        if (this.attributeKey && parentScope)
            parentScope.set(this.attributeKey, this.tag.scope);
    }

    public async execute() {
    }

    protected instantiateClass(cls) {
        this.tag.wrap(cls);
    }
}
