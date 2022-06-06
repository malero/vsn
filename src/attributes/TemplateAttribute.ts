import {Registry} from "../Registry";
import {Attribute} from "../Attribute";

@Registry.attribute('vsn-template')
export class TemplateAttribute extends Attribute {
    public static readonly canDefer: boolean = false;

    public async extract() {
        Registry.instance.templates.register(this.getAttributeBinding(), this.tag.element);
        await super.extract();
    }
}
