import {Tag} from "./Tag";
import {ElementHelper} from "./helpers/ElementHelper";
import {EventDispatcher} from "simple-ts-event-dispatcher";

export class DOM extends EventDispatcher {
    protected root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[] = [];

    constructor(
        protected document: Document,
        build: boolean = true
    ) {
        super();
        this.observer = new MutationObserver(this.mutation.bind(this));
        this.tags = [];

        if (build) {
            this.buildFrom(document, true);
        }
        this.evaluate();
    }

    public async get(selector: string, create: boolean = false) {
        if (selector.startsWith('#')) {
            return await this.getTagForElement(document.getElementById(selector.substring(1)), create);
        }
    }

    public registerElementInRoot(tag: Tag): void {
        const id: string = tag.element.getAttribute('id');
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

    async buildFrom(ele: any, isRoot: boolean = false) {
        let startTime: number = new Date().getTime();
        // Assign parents to each tag
        const allElements: HTMLElement[] = [];

        if (isRoot) {
            document.body.setAttribute('vsn-root', '');
            document.ondragover = (e) => e.preventDefault();  // Allow dragging over document
        }

        for (const tag of this.tags)
            allElements.push(tag.element);

        // Create tags for each html element with a v-attribute
        const newTags: Tag[] = [];
        const toBuild: HTMLElement[] = [];

        for (const element of (Array.from(ele.querySelectorAll(`*`)) as HTMLElement[])) { // Don't build items more than once
            if (!ElementHelper.hasVisionAttribute(element)) continue;
            if (this.queued.indexOf(element) > -1) continue;
            this.queued.push(element);
            toBuild.push(element);
        }

        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to walk ${ele}`);
            startTime = new Date().getTime();
        }

        for (const element of toBuild) {
            if (allElements.indexOf(element) > -1) continue;
            const tag: Tag = new Tag(element, this);
            this.tags.push(tag);
            newTags.push(tag);
            allElements.push(element as HTMLElement);
        }
        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to build tags for ${ele}`);
            startTime = new Date().getTime();
        }

        if (isRoot)
            this.root = await this.getTagForElement(document.body);

        // Configure, setup & execute attributes
        for (const tag of newTags)
            await tag.buildAttributes();

        for (const tag of newTags)
            await tag.compileAttributes();

        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to compile all child nodes for ${ele}`);
            startTime = new Date().getTime();
        }

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
        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to assign parents for ${ele}`);
            startTime = new Date().getTime();
        }

        for (const tag of newTags)
            await tag.setupAttributes();

        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to setup child node attrs for ${ele}`);
            startTime = new Date().getTime();
        }

        for (const tag of newTags)
            await tag.extractAttributes();
        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to extract child node attributes for ${ele}`);
            startTime = new Date().getTime();
        }

        for (const tag of newTags)
            await tag.connectAttributes();
        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to connect child node attributes for ${ele}`);
            startTime = new Date().getTime();
        }

        for (const tag of newTags) {
            await tag.finalize();
            this.queued.splice(this.queued.indexOf(tag.element), 1);
        }
        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to finalize child node attributes for ${ele}`);
            startTime = new Date().getTime();
        }

        for (const tag of newTags)
            this.observer.observe(tag.element, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true
            });

        this.trigger('built');
        if (isRoot) {
            console.warn(`Took ${new Date().getTime() - startTime}ms to build from ${ele}`);
        }
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
