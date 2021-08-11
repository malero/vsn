import {Attribute} from "../Attribute";
import {Registry} from "../Registry";
import {Bind} from "./Bind";

@Registry.attribute('vsn-format')
export class Format extends Attribute {
    public async extract() {
        const value = this.getAttributeValue(null);
        const attribute = this.getAttributeBinding(null);
        const formatter = await Registry.instance.formats.get(value);
        const bindingKey = attribute ? `vsn-bind:${attribute}` : 'vsn-bind';
        const binding: Bind = await this.tag.getAttribute<Bind>(bindingKey);
        binding.setFormatter(formatter);
    }
}
