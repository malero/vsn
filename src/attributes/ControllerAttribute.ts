import {Scope} from "../Scope";
import {Attribute} from "../Attribute";
import {Registry} from "../Registry";

@Registry.attribute('vsn-controller')
export class ControllerAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;
    public readonly registryName: string = 'controllers'
    public readonly assignToParent: boolean = true;
    protected attributeKey: string;
    protected className: string;
    protected defaultClassName: string;

    public async setup() {
        const parentScope: Scope = this.tag.parentTag.scope;
        if (!parentScope)
            return;

        this.attributeKey = this.getAttributeBinding();
        this.className = this.getAttributeValue(this.defaultClassName);

        const cls = await Registry.instance[this.registryName].get(this.className);
        const obj = this.instantiateClass(cls);

        if (this.attributeKey && obj) {
            if (this.assignToParent && parentScope) {
                parentScope.set(this.attributeKey, obj);
            } else {
                this.tag.scope.set(this.attributeKey, obj);
            }
        }
        await super.setup();
    }

    protected instantiateClass(cls): any {
        this.tag.wrap(cls);
        return this.tag.scope;
    }
}
