import {KeyAbstract} from "./KeyAbstract";

export class TouchEnd extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('touchend', this.handleEvent.bind(this));
    }
}
