import {Scope} from "../Scope";
import {Attribute} from "../Attribute";
import {Registry} from "../Registry";
import {benchmark} from "../Bencmark";

@Registry.attribute('vsn-controller')
export class ClassConstructor extends Attribute {
    public static readonly scoped: boolean = true;
    protected attributeKey: string;
    protected className: string;

    @benchmark('attributeSetup', 'ClassConstructor')
    public async setup() {
        const parentScope: Scope = this.tag.parentTag.scope;
        if (!parentScope)
            return;

        this.attributeKey = this.getAttributeBinding();
        this.className = this.getAttributeValue();

        const cls = await Registry.instance.classes.get(this.className);
        this.instantiateClass(cls);

        if (this.attributeKey && parentScope)
            parentScope.set(this.attributeKey, this.tag.scope);
    }

    protected instantiateClass(cls) {
        this.tag.wrap(cls);
    }
}
