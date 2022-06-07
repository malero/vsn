import {Registry} from "./Registry";
import {DOM} from "./DOM";

export class Component extends HTMLElement {
    protected readonly shadow: ShadowRoot;

    constructor() {
        super();
        Object.setPrototypeOf(this, Component.prototype);

        this.shadow = this.attachShadow({mode: 'open'});
        const templateId = this.getAttribute('template');
        let template: HTMLTemplateElement;

        if (templateId) {
            template = document.getElementById(templateId) as HTMLTemplateElement;
        } else {
            template = Registry.instance.templates.getSynchronous(this.tagName.toLowerCase());
        }

        this.shadow.appendChild(template.content.cloneNode(true));
        DOM.instance.buildFrom(this.shadow);
    }
}
