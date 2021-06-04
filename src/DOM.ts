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

    public async get(selector: string, create: boolean = false) {
        if (selector.startsWith('#')) {
            return await this.getTagForElement(document.getElementById(selector.substring(1)), create);
        }
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

    public async mutation(mutations: MutationRecord[]) {
        for (const mutation of mutations) {
            const tag: Tag = await this.getTagForElement(mutation.target as HTMLElement);
            if (tag) {
                tag.mutate(mutation);
            }
        }
    }

    async buildFrom(ele: any) {
        // Assign parents to each tag
        const allElements: HTMLElement[] = [];

        document.body.setAttribute('vsn-root', '');

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

        this.root = await this.getTagForElement(document.body);

        // Configure, setup & execute attributes
        for (const tag of newTags)
            await tag.buildAttributes();

        for (const tag of newTags)
            await tag.compileAttributes();

        for (const tag of newTags) {
            if (tag === this.root)
                continue;

            // Find closest ancestor
            let parentElement: HTMLElement = tag.element.parentElement as HTMLElement;
            let foundParent = false;
            while (parentElement) {
                if (allElements.indexOf(parentElement) > -1) {
                    foundParent = true;
                    tag.parentTag = await this.getTagForElement(parentElement);
                    break;
                }

                parentElement = parentElement.parentElement as HTMLElement;
            }
            if (!foundParent)
                console.error('Could not find parent for ', tag);
        }

        for (const tag of newTags)
            await tag.setupAttributes();

        for (const tag of newTags)
            await tag.extractAttributes();

        for (const tag of newTags)
            await tag.connectAttributes();

        for (const tag of newTags)
            tag.finalize();

        for (const tag of newTags)
            this.observer.observe(tag.element, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true
            });

        this.trigger('built');
    }

    async getTagForElement(element: Element, create: boolean = false) {
        for (const tag of this.tags) {
            if (tag.element === element)
                return tag;
        }

        if (create) {
            element.setAttribute('vsn-referenced', '');
            await this.buildFrom(element.parentElement);
            return await this.getTagForElement(element, false);
        }

        return null;
    }
}
