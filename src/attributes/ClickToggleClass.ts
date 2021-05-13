import {Attribute} from "../Attribute";

export class ClickToggleClass extends Attribute {
    protected cssClass: string = '';
    protected target: string = null;

    public async setup() {
        this.cssClass = this.getAttributeBinding( 'active');
        this.target = this.getAttributeValue();
        this.tag.addClickHandler(this.onClick.bind(this));
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
