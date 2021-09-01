import {Attribute} from "../Attribute";
import {Registry} from "../Registry";

@Registry.attribute('vsn-click-remove-class')
export class ClickRemoveClass extends Attribute {
    protected cssClass: string = '';
    protected target: string = null;

    public async setup() {
        this.cssClass = this.getAttributeBinding('active');
        this.target = this.getAttributeValue();
    }

    public async connect() {
        this.tag.addEventHandler('click', this.getAttributeModifiers(), this.onClick.bind(this));
    }

    onClick(e) {
        let element = this.tag.element;

        if (!!this.target) {
            element = document.getElementById(this.target);
        }

        if (element)
            element.classList.remove(this.cssClass);
    }
}
