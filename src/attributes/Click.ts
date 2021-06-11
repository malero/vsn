import {On} from "./On";

export class Click extends On {
    public async connect() {
        this.tag.addEventHandler('click', this.handleEvent.bind(this));
    }
}
