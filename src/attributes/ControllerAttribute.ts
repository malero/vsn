import {Scope} from "../Scope";
import {Attribute} from "../Attribute";
import {Registry} from "../Registry";
import {Controller} from "../Controller";
import {Service} from "../Service";

@Registry.attribute('vsn-controller')
export class ControllerAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;
    public readonly registryName: string = 'controllers'
    protected attributeKey: string;
    protected className: string;
    protected defaultClassName: string;

    public async setup() {
        this.attributeKey = this.getAttributeBinding();
        this.className = this.getAttributeValue(this.defaultClassName);
        const cls = await Registry.instance[this.registryName].get(this.className);

        if (this.attributeKey) {
            let clsScope: Scope;
            // Singleton?
            if (cls['instance'] instanceof cls) {
                clsScope = cls['instance'].scope;
                if (cls['instance'] instanceof Service) {
                    this.tag.dom.root.scope.addChild(clsScope);
                    this.tag.dom.root.scope.set(this.attributeKey, clsScope);
                }
            } else {
                clsScope = new Scope(this.tag.scope);
                const obj = new cls();
                if (obj instanceof Controller) {
                    obj.init(this.tag.scope, this.tag, this.tag.element);
                }
                clsScope.wrap(obj);
            }

            this.tag.scope.set(this.attributeKey, clsScope);
        } else {
            this.instantiateClass(cls);
        }
        await super.setup();
    }

    protected instantiateClass(cls): any {
        this.tag.wrap(cls);
        return this.tag.scope;
    }
}
