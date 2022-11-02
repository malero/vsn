import {Registry} from "../Registry";
import {On} from "./On";
import {Modifiers} from "../Modifiers";

@Registry.attribute('vsn-lazy')
export class LazyAttribute extends On {
    private loaded: boolean = false;
    private eleTop: number;

    public async setup() {
        await super.setup();
        this.eleTop = this.tag.element.getBoundingClientRect().top;
    }

    public async connect() {
        if (!this.modifiers.has('active'))
            this.modifiers.add('passive');

        this.tag.addEventHandler('scroll', this.modifiers, this.handleEvent, this);
        await this.handleEvent();
    }

    async handleEvent(e?: Event) {
        if (!this.loaded && window.scrollY + window.outerHeight >= this.eleTop) {
            this.loaded = true;
            await super.handleEvent(e);
            this.tag.removeEventHandler('scroll', this.handleEvent, this);
        }
    }
}
