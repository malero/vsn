import {On} from "./On";

export abstract class KeyAbstract extends On {
    protected specificKey: string = null;

    public async compile() {
        this.specificKey = this.getAttributeBinding();
        await super.compile();
    }

    public async connect() {
        this.tag.addEventHandler('keydown', this.getAttributeModifiers(), this.handleEvent, this);
        await super.connect();
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
