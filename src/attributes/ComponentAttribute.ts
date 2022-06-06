import {Registry} from "../Registry";
import {TemplateAttribute} from "./TemplateAttribute";
import {Component} from "../Component";

@Registry.attribute('vsn-component')
export class ComponentAttribute extends TemplateAttribute {
    public static readonly scoped: boolean = true;

    public async extract() {
        const name = this.getAttributeBinding();
        if (!Registry.instance.components.has(name)) {
            await super.extract();
            const clsName = this.getAttributeValue();
            let cls = Component;
            if (clsName) {
                cls = await Registry.instance.components.get(clsName);
                if (!cls) {
                    throw new Error(`Component ${clsName} not found`);
                }
            }
            Registry.instance.components.register(name, cls);
        }
    }
}
