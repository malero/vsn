import {KeyAbstract} from "./KeyAbstract";
import {Registry} from "../Registry";

@Registry.attribute('vsn-key-up')
export class KeyUp extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('keyup', this.modifiers, this.handleEvent, this);
        await super.connect();
    }
}
