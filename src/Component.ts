import {Registry} from "./Registry";
import {SlotTag} from "./Tag/SlotTag";
import {SlottedTag} from "./Tag/SlottedTag";
import {ShadowDOM} from "./DOM/ShadowDOM";
import {DOM} from "./DOM";

export class Component extends HTMLElement {
    protected readonly shadow: ShadowRoot;
    protected readonly shadowDOM: ShadowDOM;

    constructor() {
        super();
        Object.setPrototypeOf(this, Component.prototype);

        this.shadowDOM = new ShadowDOM(DOM.instance, this, false);
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
            const slotTagPromise = this.shadowDOM.buildTag(slot,false, SlotTag);
            const promise = new Promise<SlotTag>((resolve, reject) => {
                slot.addEventListener('slotchange', (e) => {
                    slotTagPromise.then(async (slotTag) => {
                        for (const child of slot.assignedNodes()) {
                            const t = await this.shadowDOM.buildTag<SlottedTag>(child as HTMLElement, false, SlottedTag);
                            await t?.slotted(slotTag);
                            tagsToSetup.push(t);
                        }
                        resolve(slotTag);
                    });
                });
            });
            slotPromises.push(promise);
        });
        Promise.all(slotPromises).then(async (slotTags: SlotTag[]) => {
            console.log('Building after slot setup', this);
        });
    }

    async connectedCallback() {
        //const tag = await this.shadowDOM.buildTag(this, true);
        //tag.createScope(true);
        console.log('Building from shadow', this.shadow);
        await this.shadowDOM.buildFrom(this.shadow, true, true);
        ///await tag.dom.resetBranch(tag);
        //await tag.dom.setupTags([tag]);
    }
}
