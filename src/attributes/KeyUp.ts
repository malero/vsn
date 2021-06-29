import {KeyAbstract} from "./KeyAbstract";

export class KeyUp extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('keyup', this.getAttributeModifiers(), this.handleEvent.bind(this));
    }
}
