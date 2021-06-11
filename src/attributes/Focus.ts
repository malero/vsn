import {On} from "./On";

export class Focus extends On {
    public async connect() {
        this.tag.addEventHandler('focus', this.handleEvent.bind(this));
    }
}
