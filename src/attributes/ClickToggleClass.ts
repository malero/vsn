import {Attribute} from "../Attribute";
import {Registry} from "../Registry";

@Registry.attribute('vsn-click-toggle-class')
export class ClickToggleClass extends Attribute {
    protected cssClass: string = '';
    protected target: string = null;

    public async setup() {
        this.cssClass = this.getAttributeBinding( 'active');
        this.target = this.getAttributeValue();
        await super.setup();
    }

    public async connect() {
        this.tag.addEventHandler('click', this.getAttributeModifiers(), this.onClick.bind(this));
        await super.connect();
    }

    onClick(e) {
        let element = this.tag.element;
        if (!!this.target) {

            element = document.getElementById(this.target);
        }

        if (element)
            element.classList.toggle(this.cssClass);
    }
}
