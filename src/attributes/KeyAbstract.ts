import {On} from "./On";

export abstract class KeyAbstract extends On {
    protected specificKey: string = null;

    public async compile() {
        await super.compile();
        this.specificKey = this.getAttributeBinding();
    }

    public async connect() {
        this.tag.addEventHandler('keydown', this.handleEvent.bind(this));
    }

    public async handleEvent(e) {
        let triggerEvent: boolean = false;

        if ([undefined, null, ''].indexOf(this.specificKey) === -1) {
            if (e.key.toLowerCase() === this.specificKey || e.code.toLowerCase() === this.specificKey)
                triggerEvent = true;
        } else
            triggerEvent = true;

        if (triggerEvent)
            await super.handleEvent(e);
    }
}