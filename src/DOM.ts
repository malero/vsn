import {Tag} from "./Tag";
import {ElementHelper} from "./helpers/ElementHelper";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {Configuration} from "./Configuration";
import {Tree} from "./AST";
import {Query} from "./Query";

export class DOM extends EventDispatcher {
    protected static _instance: DOM;
    protected root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[] = [];

    constructor(
        protected rootElement: Document,
        build: boolean = true,
        protected debug: boolean = false
    ) {
        super();
        this.observer = new MutationObserver(this.mutation.bind(this));
        this.tags = [];

        if (build) {
            this.buildFrom(rootElement, true);
        }
        this.evaluate();
        Configuration.instance.bind('change', this.evaluate.bind(this));
    }

    public async get(selector: string, create: boolean = false) {
        const elements: Tag[] = [];
        const nodes = this.querySelectorAll(selector);
        for (let i = 0; i < nodes.length; i++) {
            elements.push(await this.getTagForElement(nodes[i] as Element, create));
        }
        return elements;
    }

    public registerElementInRoot(tag: Tag): void {
        const id: string = tag.element.getAttribute('id');
        if (!!id)
            this.root.scope.set(`#${id}`, tag.scope);
    }

    public querySelectorAll(q: string): NodeList {
        return this.rootElement.querySelectorAll(q);
    }

    public querySelector(q: string): Element {
        return this.rootElement.querySelector(q);
    }

    public async eval(code: string) {
        const tree = new Tree(code);
        await tree.prepare(this.root.scope, this);
        return await tree.evaluate(this.root.scope, this);
    }

    public async evaluate() {
        clearTimeout(this.evaluateTimeout);
        for (const tag of this.tags) {
            await tag.evaluate();
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

        if (ele && ele.querySelectorAll) {
            for (const element of (Array.from(ele.querySelectorAll(`*`)) as HTMLElement[])) { // Don't build items more than once
                if (!ElementHelper.hasVisionAttribute(element)) continue;
                if (this.queued.indexOf(element) > -1) continue;
                this.queued.push(element);
                toBuild.push(element);
            }
        }

        for (const element of toBuild) {
            if (allElements.indexOf(element) > -1) continue;
            const tag: Tag = new Tag(element, this);
            this.tags.push(tag);
            newTags.push(tag);
            allElements.push(element as HTMLElement);
        }

        if (isRoot)
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

        for (const tag of newTags) {
            await tag.finalize();
            this.queued.splice(this.queued.indexOf(tag.element), 1);
        }

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

        if (element && create) {
            element.setAttribute('vsn-ref', '');
            await this.buildFrom(element.parentElement);
            return await this.getTagForElement(element, false);
        }

        return null;
    }

    public static get instance(): DOM {
        if (!DOM._instance)
            DOM._instance = new DOM(document ,false, false);

        return DOM._instance;
    }
}
