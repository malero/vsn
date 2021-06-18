import {KeyAbstract} from "./KeyAbstract";

export class TouchStart extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('touchstart', this.handleEvent.bind(this));
    }
}
