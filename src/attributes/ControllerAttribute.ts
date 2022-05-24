import {Scope} from "../Scope";
import {Attribute} from "../Attribute";
import {Registry} from "../Registry";

@Registry.attribute('vsn-controller')
export class ControllerAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;
    protected attributeKey: string;
    protected className: string;
    protected defaultClassName: string;

    public async setup() {
        const parentScope: Scope = this.tag.parentTag.scope;
        if (!parentScope)
            return;

        this.attributeKey = this.getAttributeBinding();
        this.className = this.getAttributeValue(this.defaultClassName);

        const cls = await Registry.instance.controllers.get(this.className);
        this.instantiateClass(cls);

        if (this.attributeKey && parentScope)
            parentScope.set(this.attributeKey, this.tag.scope);
        await super.setup();
    }

    protected instantiateClass(cls) {
        this.tag.wrap(cls);
    }
}
