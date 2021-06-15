import {On} from "./On";

export class Blur extends On {
    public async connect() {
        this.tag.addEventHandler('blur', this.handleEvent.bind(this));
    }
}