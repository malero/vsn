import {KeyAbstract} from "./KeyAbstract";

export class TouchMove extends KeyAbstract {
    public async connect() {
        this.tag.addEventHandler('touchmove', this.handleEvent.bind(this));
    }
}
