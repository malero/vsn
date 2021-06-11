import {On} from "./On";

export class MouseLeave extends On {
    public async connect() {
        this.tag.addEventHandler('mouseleave', this.handleEvent.bind(this));
    }
}
