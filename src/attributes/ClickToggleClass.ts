import {Attribute} from "../Attribute";

export class ClickToggleClass extends Attribute {
    protected cssClass: string = '';
    protected target: string = null;

    constructor(tag) {
        super(tag);
    }

    public async setup() {
        this.cssClass = this.getAttributeValue('v-click-toggle-class', 0, 'active');
        this.target = this.getAttributeValue('v-click-toggle-class', 1);
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
