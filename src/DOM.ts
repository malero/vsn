import {Tag} from "./Tag";
import {ElementHelper} from "./helpers/ElementHelper";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {Configuration} from "./Configuration";
import {Tree} from "./AST";
import {TagList} from "./Tag/List";
import {benchmarkEnd, benchmarkStart} from "./Bencmark";
import {VisionHelper} from "./helpers/VisionHelper";

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
        const nodes = this.querySelectorAll(selector);
        return await this.getTagsForElement(Array.from(nodes) as Element[], create);
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

        if (VisionHelper.doBenchmark) benchmarkStart('DOM','findElements');
        if (ele && ele.querySelectorAll) {
            for (const element of (Array.from(ele.querySelectorAll(`*`)) as HTMLElement[])) { // Don't build items more than once
                if (!ElementHelper.hasVisionAttribute(element)) continue;
                if (this.queued.indexOf(element) > -1) continue;
                this.queued.push(element);
                toBuild.push(element);
            }
        }
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM', 'findElements');

        if (VisionHelper.doBenchmark) benchmarkStart('DOM', 'buildTags');
        for (const element of toBuild) {
            if (allElements.indexOf(element) > -1) continue;
            const tag: Tag = new Tag(element, this);
            this.tags.push(tag);
            newTags.push(tag);
            allElements.push(element as HTMLElement);
        }
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM', 'buildTags');

        if (isRoot)
            this.root = await this.getTagForElement(document.body);

        // Configure, setup & execute attributes
        if (VisionHelper.doBenchmark) benchmarkStart('DOM','buildTagAttributes');
        for (const tag of newTags)
            await tag.buildAttributes();
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM','buildTagAttributes');

        if (VisionHelper.inDevelopment) benchmarkStart('DOM', 'compileAttributes');
        for (const tag of newTags)
            await tag.compileAttributes();
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM','compileAttributes');

        if (VisionHelper.doBenchmark) benchmarkStart('DOM', 'buildTree');
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
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM', 'buildTree');

        if (VisionHelper.doBenchmark) benchmarkStart('DOM', 'setupAttributes');
        for (const tag of newTags)
            await tag.setupAttributes();
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM', 'setupAttributes');

        if (VisionHelper.doBenchmark) benchmarkStart('DOM', 'extractAttributes');
        for (const tag of newTags)
            await tag.extractAttributes();
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM', 'extractAttributes');

        if (VisionHelper.doBenchmark) benchmarkStart('DOM', 'connectAttributes');
        for (const tag of newTags)
            await tag.connectAttributes();
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM', 'connectAttributes');

        if (VisionHelper.doBenchmark) benchmarkStart('DOM', 'finalizeTags');
        for (const tag of newTags) {
            await tag.finalize();
            this.queued.splice(this.queued.indexOf(tag.element), 1);
        }
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM', 'finalizeTags');

        if (VisionHelper.doBenchmark) benchmarkStart('DOM', 'observeTags');
        for (const tag of newTags)
            this.observer.observe(tag.element, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true
            });
        if (VisionHelper.doBenchmark) benchmarkEnd('DOM', 'observeTags');

        this.trigger('built');
    }

    async getTagsForElement(elements: Element[], create: boolean = false) {
        const tags: TagList = new TagList();
        const found: Element[] = [];
        for (const tag of this.tags)
        {
            if (elements.indexOf(tag.element) > -1) {
                tags.push(tag);
                found.push(tag.element);
            }
        }

        if (create) {
            const notFound: Element[] = [...elements];
            for (let i = notFound.length; i >= 0; i--) {
                const element: Element = notFound[i];
                if (found.indexOf(element) > -1)
                    notFound.pop();
            }

            for (const element of notFound) {
                tags.push(await this.getTagForElement(element, create));
            }
        }

        return tags;
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
