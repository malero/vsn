import {Registry} from "../Registry";
import {On} from "./On";

@Registry.attribute('vsn-lazy')
export class LazyAttribute extends On {
    private loaded: boolean = false;
    private eleTop: number;

    public async setup() {
        await super.setup();
        this.eleTop = this.tag.element.getBoundingClientRect().top;
    }

    public async connect() {
        this.tag.addEventHandler('scroll', ['passive'], this.handleEvent.bind(this));
        await this.handleEvent();
    }

    async handleEvent(e?: Event) {
        if (!this.loaded && window.scrollY + window.outerHeight >= this.eleTop) {
            this.loaded = true;
            await this.handler.evaluate(this.tag.scope, this.tag.dom, this.tag);
            this.tag.removeEventHandler('scroll', this.handleEvent.bind(this));
        }
    }
}
