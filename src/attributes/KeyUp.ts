import {On} from "./On";

export class KeyUp extends On {
    public async connect() {
        this.tag.addEventHandler('keyup', this.handleEvent.bind(this));
    }
}
