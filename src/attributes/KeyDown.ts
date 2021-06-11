import {On} from "./On";

export class KeyDown extends On {
    public async connect() {
        this.tag.addEventHandler('keydown', this.handleEvent.bind(this));
    }
}