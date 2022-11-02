import {KeyAbstract} from "./KeyAbstract";
import {Registry} from "../Registry";

@Registry.attribute('vsn-key-down')
export class KeyDown extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('keydown', this.modifiers, this.handleEvent, this);
        await super.connect();
    }
}
