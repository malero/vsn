import {Tag} from "./Tag";

export class DOM {
    protected tags: Tag[];

    constructor(
        protected document: Document
    ) {
        this.tags = [];
        this.tags.push(new Tag(Array.from(document.getElementsByTagName('body'))[0], this));
        this.buildFrom(document);
    }

    buildFrom(ele: any) {
        // Assign parents to each tag
        const allElements: HTMLElement[] = [];
        for (const tag of this.tags)
            allElements.push(tag.element);

        // Create tags for each html element with a v-attribute
        const newTags: Tag[] = [];
        for (const selector in Tag.attributeMap) {
            for (const element of Array.from(ele.querySelectorAll(`[${selector}]`))) {
                if (allElements.indexOf(element as HTMLElement) > -1) continue;

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

        // Configure & setup attributes
        for (const tag of newTags)
            tag.buildAttributes();

        for (const tag of newTags)
            tag.setupAttributes();
    }

    getTagForElement(element: Element): Tag {
        for (const tag of this.tags) {
            if (tag.element === element)
                return tag;
        }

        return null;
    }
}
