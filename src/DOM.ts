import {Tag} from "./Tag";
import {ElementHelper} from "./helpers/ElementHelper";
import {Configuration} from "./Configuration";
import {Tree} from "./AST";
import {TagList} from "./Tag/List";
import {WrappedWindow} from "./DOM/WrappedWindow";
import {WrappedDocument} from "./DOM/WrappedDocument";
import {Scope} from "./Scope";
import {EventDispatcher} from "./EventDispatcher";
import {ClassNode} from "./AST/ClassNode";
import {Registry} from "./Registry";

export enum EQuerySelectDirection {
    ALL,
    UP,
    DOWN
}

export class DOM extends EventDispatcher {
    protected static _instance: DOM;
    protected _root: Tag;
    protected _ready: Promise<boolean>;
    protected tags: Tag[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[] = [];
    protected window: WrappedWindow;
    protected document: WrappedDocument;
    protected _built: boolean = false;
    public selected: Tag;

    constructor(
        protected rootElement: Document,
        build: boolean = true,
        protected debug: boolean = false
    ) {
        super();
        this._ready = new Promise((resolve) => {
            this.once('built', () => {
                resolve(true);
            });
        });

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

    public get built(): boolean {
        return this._built;
    }

    public get root(): Tag {
        return this._root;
    }

    public get ready(): Promise<boolean> {
        return this.promise('builtRoot');
    }

    public async get(selector: string, create: boolean = false, tag: Tag = null, direction: EQuerySelectDirection = EQuerySelectDirection.DOWN): Promise<TagList> {
        switch (selector) {
            case 'window':
                return new TagList(this.window);
            case 'document':
                return new TagList(this.document);
            case 'body':
                return new TagList(this.root);
            default:
                let nodes;
                if (direction === EQuerySelectDirection.DOWN) {
                    nodes = this.querySelectorAll(selector, tag);
                } else if (direction === EQuerySelectDirection.UP) {
                    nodes = [this.querySelectorClosest(selector, tag)];
                } else {
                    nodes = this.querySelectorAll(selector);
                }
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

    public querySelectorClosest(q: string, tag: Tag = null): HTMLElement {
        return tag.element.closest(q);
    }

    public querySelectPath(path: string[], element: HTMLElement = null): HTMLElement[] {
        const current = path.shift();
        if (!current) return [];
        const elements = Array.from(element ? this.querySelectorElement(element, current) : this.querySelectorAll(current));
        if (path.length > 0) {
            const result = [];
            for (const _element of elements) {
                result.push(...this.querySelectPath([...path], _element as HTMLElement));
            }
            return result;
        }

        return elements as HTMLElement[];
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
        let matches = element.querySelectorAll(q);

        if (matches.length === 0 && (element as HTMLElement).shadowRoot) {
            matches = (element as HTMLElement).shadowRoot.querySelectorAll(q);
        }
        return matches;
    }

    public querySelector(q: string): Element {
        return this.rootElement.querySelector(q);
    }

    public async exec(code: string) {
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
            let tag: Tag = await this.getTagForElement(mutation.target as HTMLElement);
            if (tag) {
                tag.mutate(mutation);
            }

            // Check for class changes
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                await ClassNode.checkForClassChanges(mutation.target as HTMLElement, this, tag);
            }

            for (const ele of Array.from(mutation.removedNodes)) {
                const toRemove: Tag = await this.getTagForElement(ele as HTMLElement);
                if (toRemove) {
                    toRemove.deconstruct();
                }
            }
        }
    }

    async buildFrom(ele: any, isRoot: boolean = false, forComponent: boolean = false) {
        if (isRoot) {
            document.body.setAttribute('vsn-root', '');
            document.ondragover = (e) => e.cancelable && e.preventDefault();  // Allow dragging over document
        }

        // Create tags for each html element with a v-attribute
        const newTags: Tag[] = [];
        const toBuild: HTMLElement[] = [];

        const checkElement = (e: HTMLElement) => {
            if (ElementHelper.hasVisionAttribute(e)) {
                if (
                    (!forComponent && e.hasAttribute('slot'))
                ) return;
                if (this.queued.indexOf(e) > -1) return;
                this.queued.push(e);
                toBuild.push(e);
            }
        }
        const scanChildren = (e: HTMLElement) => {
            for (const element of Array.from(e.children) as HTMLElement[]) {
                checkElement(element);
                if (element.tagName.toLowerCase() !== 'template')
                    scanChildren(element);
            }
        }
        checkElement(ele);
        scanChildren(ele);

        for (const element of toBuild) {
            if (element[Tag.TaggedVariable]) continue;
            const tag: Tag = new Tag(element, this);
            this.tags.push(tag);
            newTags.push(tag);
        }

        if (isRoot)
            this._root = await this.getTagForElement(document.body);

        // Configure, setup & execute attributes
        for (const tag of newTags)
            await tag.buildAttributes();

        for (const tag of newTags)
            await tag.compileAttributes();

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

        for (const tag of newTags) {
            this.observer.observe(tag.element, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true
            });
        }

        if (isRoot) {
            this._built = true;
            this.dispatch('builtRoot')
        }
        this.dispatch('built', newTags);
    }

    async getTagsForElements(elements: Element[], create: boolean = false) {
        const tags: TagList = new TagList();
        const found: Element[] = [];

        for (const element of elements) {
            if (element[Tag.TaggedVariable]) {
                tags.push(element[Tag.TaggedVariable]);
                found.push(element);
            }
        }

        if (create) {
            const notFound: Element[] = [...elements];
            for (let i = notFound.length; i >= 0; i--) {
                const element: Element = notFound[i];
                if (found.indexOf(element) > -1) {
                    notFound.splice(i, 1);
                }
            }

            for (const element of notFound) {
                tags.push(await this.getTagForElement(element, create));
            }
        }

        return tags;
    }

    async getTagForElement(element: Element, create: boolean = false, forComponent: boolean = false) {
        if (element[Tag.TaggedVariable])
            return element[Tag.TaggedVariable];

        if (element && create) {
            if (element instanceof HTMLElement)
                element.setAttribute('vsn-ref', '');
            await this.buildFrom(element.parentElement || element, false, forComponent);
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
