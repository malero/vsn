import {KeyAbstract} from "./KeyAbstract";

export class KeyDown extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('keydown', this.getAttributeModifiers(), this.handleEvent.bind(this));
    }
}
