import {On} from "./On";

export class MouseEnter extends On {
    public async connect() {
        this.tag.addEventHandler('mouseenter', this.handleEvent.bind(this));
    }
}