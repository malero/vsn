import {KeyAbstract} from "./KeyAbstract";
import {Registry} from "../Registry";

@Registry.attribute('vsn-key-down')
export class KeyDown extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('keydown', this.getAttributeModifiers(), this.handleEvent.bind(this));
        await super.connect();
    }
}
