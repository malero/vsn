import {Tag} from "./Tag";
import {ElementHelper} from "./helpers/ElementHelper";
import {Configuration} from "./Configuration";
import {Tree} from "./AST";
import {TagList} from "./Tag/List";
import {benchmarkEnd, benchmarkStart} from "./Bencmark";
import {VisionHelper} from "./helpers/VisionHelper";
import {WrappedWindow} from "./DOM/WrappedWindow";
import {WrappedDocument} from "./DOM/WrappedDocument";
import {Scope} from "./Scope";
import {EventDispatcher} from "./EventDispatcher";

export class DOM extends EventDispatcher {
    protected static _instance: DOM;
    protected _root: Tag;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[] = [];
    protected window: WrappedWindow;
    protected document: WrappedDocument;
    public selected: Tag;

    constructor(
        protected rootElement: Document,
        build: boolean = true,
        protected debug: boolean = false
    ) {
        super();
        this.observer = new MutationObserver(this.mutation.bind(this));
        this.tags = [];

        this.window = new WrappedWindow(window);
        this.document = new WrappedDocument(window.document);

        if (build) {
            this.buildFrom(rootElement, true);
        }
        this.evaluate();
        Configuration.instance.on('change', this.evaluate.bind(this));
    }

    public get root(): Tag {
        return this._root;
    }

    public async get(selector: string, create: boolean = false, tag: Tag = null) {
        switch (selector) {
            case 'window':
                return new TagList(this.window);
            case 'document':
                return new TagList(this.document);
            default:
                const nodes = this.querySelectorAll(selector, tag);
                return await this.getTagsForElements(Array.from(nodes) as Element[], create);
        }
    }

    public async getFromTag(tag: Tag, selector: string, create: boolean = false) {
        const nodes = this.querySelectorElement(tag.element, selector);
        return await this.getTagsForElements(Array.from(nodes) as Element[], create);
    }

    public registerElementInRoot(tag: Tag): void {
        const id: string = tag.element.getAttribute('id');
        if (!!id)
            this.root.scope.set(`#${id}`, tag.scope);
    }

    public querySelectorAll(q: string, tag: Tag = null): NodeList | HTMLElement[] {
        const element: HTMLElement | Document = tag && !q.startsWith('#') ? tag.element : this.rootElement;
        return this.querySelectorElement(element, q);
    }

    public querySelectorElement(element: HTMLElement | Document, q: string): NodeList | HTMLElement[] {
        const parentIndex: number = q.indexOf(':parent');
        if (parentIndex > -1) {
            const _q = q.substring(0, parentIndex);
            const rest = q.substring(parentIndex + 7);
            if (_q.length > 0) {
                const nodeList = [];
                for (const _element of Array.from(this.querySelectorElement(element, _q))) {
                    if (rest.length > 0) {
                        nodeList.push(...Array.from(this.querySelectorElement(_element.parentElement, rest)));
                    } else {
                        nodeList.push(_element.parentElement);
                    }
                }
                return nodeList;
            } else if (rest.length === 0) {
                return [element.parentElement];
            } else {
                return this.querySelectorElement(element.parentElement, rest);
            }
        }
        return element.querySelectorAll(q);
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
        const toSkip: HTMLElement[] = [];

        if (ele && ele.querySelectorAll) {
            for (const element of (Array.from(ele.querySelectorAll(`*`)) as HTMLElement[])) { // Don't build items more than once
                if (!ElementHelper.hasVisionAttribute(element)) continue;
                if ((element.hasAttribute('vsn-template') && element.tagName === 'template') || toSkip.indexOf(element.parentElement) > -1) {
                    toSkip.push(element);
                    continue;
                }
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
            this._root = await this.getTagForElement(document.body);

        // Configure, setup & execute attributes
        for (const tag of newTags)
            await tag.buildAttributes();

        for (const tag of newTags)
            await tag.compileAttributes();

        for (const tag of newTags) {
            if (tag === this.root)
                continue;

            // Find the closest ancestor
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

        newTags.forEach(tag => this.observer.observe(tag.element, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true
            }));

        this.dispatch('built');
    }

    async getTagsForElements(elements: Element[], create: boolean = false) {
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
            if (element instanceof HTMLElement)
                element.setAttribute('vsn-ref', '');
            await this.buildFrom(element.parentElement || element);
            return await this.getTagForElement(element, false);
        }

        return null;
    }

    async getTagForScope(scope: Scope) {
        for (const tag of this.tags) {
            if (tag.scope === scope)
                return tag;
        }

        return null;
    }

    public static get instance(): DOM {
        if (!DOM._instance)
            DOM._instance = new DOM(document ,false, false);

        return DOM._instance;
    }
}
