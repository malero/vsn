import {Tag} from "./Tag";
import {ElementHelper} from "./helpers/ElementHelper";

export class DOM {
    protected tags: Tag[];

    constructor(
        protected document: Document
    ) {
        this.tags = [];
        this.tags.push(new Tag(Array.from(document.getElementsByTagName('body'))[0], this));
        this.buildFrom(document);
    }

    async buildFrom(ele: any) {
        // Assign parents to each tag
        const allElements: HTMLElement[] = [];
        for (const tag of this.tags)
            allElements.push(tag.element);

        // Create tags for each html element with a v-attribute
        const newTags: Tag[] = [];
        for (const _e of Array.from(ele.querySelectorAll(`*`))) {
            const element: HTMLElement = _e as HTMLElement;
            if (allElements.indexOf(element) > -1) continue;
            if (ElementHelper.hasVisionAttribute(element)) {
                const tag: Tag = new Tag(element as HTMLElement, this);
                this.tags.push(tag);
                newTags.push(tag);
                allElements.push(element as HTMLElement);
            }
        }

        for (const tag of newTags) {
            // Find closest ancestor
            let parentElement: HTMLElement = tag.element.parentElement as HTMLElement;
            while (parentElement) {
                if (allElements.indexOf(parentElement) > -1) {
                    tag.parent = this.getTagForElement(parentElement);
                    break;
                }

                parentElement = parentElement.parentElement as HTMLElement;
            }
        }

        // Configure, setup & execute attributes
        for (const tag of newTags)
            await tag.buildAttributes();

        for (const tag of newTags)
            await tag.setupAttributes();

        for (const tag of newTags)
            await tag.executeAttributes();
    }

    getTagForElement(element: Element): Tag {
        for (const tag of this.tags) {
            if (tag.element === element)
                return tag;
        }

        return null;
    }
}
