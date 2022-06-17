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

        this.setAttribute('vsn-scope', '');
        this.shadow.appendChild(template.content.cloneNode(true));
        for (const child of Array.from(this.shadow.children)) {
            child['shadowParent'] = this;
        }
        const slotPromises = [];
        const tagsToSetup = [];
        this.shadow.querySelectorAll('slot').forEach((slot) => {
            const slotTagPromise = DOM.instance.buildTag(slot,false, SlotTag);
            const promise = new Promise<SlotTag>((resolve, reject) => {
                slot.addEventListener('slotchange', (e) => {
                    slotTagPromise.then(async (slotTag) => {

                        for (const child of slot.assignedNodes()) {
                            const t = await DOM.instance.buildTag<SlottedTag>(child as HTMLElement, false, SlottedTag);
                            await t?.slotted(slotTag);
                            tagsToSetup.push(t);
                        }
                        resolve(slotTag);
                    });
                });
            })
            slotPromises.push(promise);
        });
        Promise.all(slotPromises).then(async (slotTags: SlotTag[]) => {
            await DOM.instance.buildFrom(this, false, true);
            await DOM.instance.setupTags(slotTags);
            await DOM.instance.setupTags(tagsToSetup);
        });
    }

    async connectedCallback() {
        const tag = await DOM.instance.buildTag(this, true);
        tag.createScope(true);
        await DOM.instance.buildFrom(this.shadow);
        await tag.dom.resetBranch(tag);
        await tag.dom.setupTags([tag]);
    }
}
