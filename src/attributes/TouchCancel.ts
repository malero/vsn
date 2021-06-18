import {KeyAbstract} from "./KeyAbstract";

export class TouchCancel extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('touchcancel', this.handleEvent.bind(this));
    }
}
