import {KeyAbstract} from "./KeyAbstract";

export class KeyDown extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('keydown', this.handleEvent.bind(this));
    }
}
