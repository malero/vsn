import {Registry} from "./Registry";
import {DOM} from "./DOM";
import {SlotTag} from "./Tag/SlotTag";
import {SlottedTag} from "./Tag/SlottedTag";

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

        this.setAttribute('vsn-ref', '');

        this.shadow.appendChild(template.content.cloneNode(true));
        this.shadow.querySelectorAll('slot').forEach((slot) => {
            const slotTagPromise = DOM.instance.buildTag(slot,false, SlotTag);
            slot.addEventListener('slotchange', async (e) => {
                for (const child of slot.assignedNodes()) {
                    const t = await DOM.instance.buildTag(child as HTMLElement, false, SlottedTag);
                    await t?.slotted(slot);
                }
                slotTagPromise.then((slotTag) => {
                    slotTag.buildAttributes();
                });
            });
        });

        DOM.instance.buildFrom(this.shadow);
    }
}
