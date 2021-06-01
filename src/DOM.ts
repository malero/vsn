import {Tag} from "./Tag";
import {ElementHelper} from "./helpers/ElementHelper";
import {EventDispatcher} from "simple-ts-event-dispatcher";

export class DOM extends EventDispatcher {
    protected root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;

    constructor(
        protected document: Document,
        build: boolean = true
    ) {
        super();
        this.observer = new MutationObserver(this.mutation.bind(this));
        this.tags = [];

        if (build) {
            this.buildFrom(document);
        }
        this.evaluate();
    }

    public registerElementInRoot(tag: Tag): void {
        const id: string = ElementHelper.normalizeElementID(tag.element.getAttribute('id'));
        if (!!id)
            this.root.scope.set(`#${id}`, tag.scope);
    }

    public evaluate() {
        clearTimeout(this.evaluateTimeout);
        for (const tag of this.tags) {
            tag.evaluate();
        }
    }

    public mutation(mutations: MutationRecord[]) {
        for (const mutation of mutations) {
            const tag: Tag = this.getTagForElement(mutation.target as HTMLElement);
            if (tag) {
                tag.mutate(mutation);
            }
        }
    }

    async buildFrom(ele: any) {
        // Assign parents to each tag
        const allElements: HTMLElement[] = [];

        document.body.setAttribute('v-root', '');

        for (const tag of this.tags)
            allElements.push(tag.element);

        // Create tags for each html element with a v-attribute
        const newTags: Tag[] = [];
        for (const _e of Array.from(ele.querySelectorAll(`*`))) {
            const element: HTMLElement = _e as HTMLElement;
            if (allElements.indexOf(element) > -1) continue;
            if (ElementHelper.hasVisionAttribute(element)) {
                this.observer.observe(element, {
                    attributes: true,
                    characterData: true,
                    childList: true
                });
                const tag: Tag = new Tag(element as HTMLElement, this);
                this.tags.push(tag);
                newTags.push(tag);
                allElements.push(element as HTMLElement);
            }
        }

        this.root = this.getTagForElement(document.body);

        // Configure, setup & execute attributes
        console.warn('Building attributes.');
        for (const tag of newTags)
            await tag.buildAttributes();

        console.warn('Setting parents.');
        for (const tag of newTags) {
            if (tag === this.root)
                continue;

            // Find closest ancestor
            let parentElement: HTMLElement = tag.element.parentElement as HTMLElement;
            let foundParent = false;
            while (parentElement) {
                if (allElements.indexOf(parentElement) > -1) {
                    foundParent = true;
                    tag.parentTag = this.getTagForElement(parentElement);
                    break;
                }

                parentElement = parentElement.parentElement as HTMLElement;
            }
            if (!foundParent)
                console.log('Could not find parent for ', tag);
        }

        console.warn('Setting up attributes.');
        for (const tag of newTags)
            await tag.setupAttributes();

        console.warn('Executing attributes.');
        for (const tag of newTags)
            await tag.executeAttributes();

        for (const tag of newTags)
            this.registerElementInRoot(tag);

        for (const tag of newTags)
            tag.finalize();

        this.trigger('built');
    }

    getTagForElement(element: Element): Tag {
        for (const tag of this.tags) {
            if (tag.element === element)
                return tag;
        }

        return null;
    }
}
