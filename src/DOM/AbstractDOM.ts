import {Tag, TagState} from "../Tag";
import {WrappedWindow} from "./WrappedWindow";
import {WrappedDocument} from "./WrappedDocument";
import {Configuration} from "../Configuration";
import {TagList} from "../Tag/TagList";
import {Tree} from "../AST";
import {ClassNode} from "../AST/ClassNode";
import {Registry} from "../Registry";
import {ElementHelper} from "../helpers/ElementHelper";
import {SlotTag} from "../Tag/SlotTag";
import {SlottedTag} from "../Tag/SlottedTag";
import {Scope} from "../Scope";
import {EventDispatcher} from "../EventDispatcher";

export enum EQuerySelectDirection {
    ALL,
    UP,
    DOWN
}

export abstract class AbstractDOM extends EventDispatcher {
    protected _root: Tag;
    protected _ready: Promise<boolean>;
    protected tags: Tag[];
    protected tagsToDeconstruct: Tag[];
    protected scopesToDeconstruct: Scope[];
    protected observer: MutationObserver;
    protected evaluateTimeout: any;
    protected queued: HTMLElement[] = [];
    protected window: WrappedWindow;
    protected document: WrappedDocument;
    protected _built: boolean = false;

    constructor(
        protected rootElement: HTMLElement,
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
        this.tagsToDeconstruct = [];
        this.scopesToDeconstruct = [];

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

    public deregisterElementInRoot(tag: Tag) {
        if (!tag.element || !this.root) return;
        const id: string = tag.element.getAttribute('id');
        if (!!id)
            this.root.scope.remove(`#${id}`);
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
                        nodeList.push(...Array.from(this.querySelectorElement(AbstractDOM.getParentElement(_element as HTMLElement), rest)));
                    } else {
                        nodeList.push(AbstractDOM.getParentElement(_element as HTMLElement));
                    }
                }
                return nodeList;
            } else if (rest.length === 0) {
                return [AbstractDOM.getParentElement(element as HTMLElement)];
            } else {
                return this.querySelectorElement(AbstractDOM.getParentElement(element as HTMLElement), rest);
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

    public async exec(code: string, data: object = null, cleanupScope: boolean = false) {
        let scope = this.root.scope;
        if (data !== null) {
            if (data instanceof Scope) {
                scope = data
            } else {
                scope = new Scope();
                scope.wrap(data);
                cleanupScope = true;
            }
        }
        const tree = new Tree(code);
        await tree.prepare(scope, this);
        if (cleanupScope)
            this.scopesToDeconstruct.push(scope);
        return await tree.evaluate(scope, this);
    }

    public async evaluate() {
        clearTimeout(this.evaluateTimeout);
        for (const tag of this.tags) {
            await tag.evaluate();
        }
    }

    public getTagsFromParent(parent: Node, includeParent: boolean = true) {
        const tags: Tag[] = [];
        if (includeParent && parent[Tag.TaggedVariable]) {
            tags.push(parent[Tag.TaggedVariable]);
        }

        for (const ele of Array.from(parent.childNodes)) {
            tags.push(...this.getTagsFromParent(ele, true));
        }

        return tags;
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
                for (const tag of this.getTagsFromParent(ele)) {
                    if (tag.hasAttribute('vsn-template')) continue;
                    this.tagsToDeconstruct.push(tag);
                }
            }
        }
    }

    async discover(ele: HTMLElement, forComponent: boolean = false): Promise<HTMLElement[]> {
        const discovered: HTMLElement[] = [];
        const checkElement = (e: HTMLElement): boolean => {
            if (!forComponent && e?.tagName?.includes('-')) {
                return false;
            }

            if (Registry.instance.tags.has(e?.tagName?.toLowerCase())) {
                return false;
            }

            if (ElementHelper.hasVisionAttribute(e)) {
                if (
                    (!forComponent && e.hasAttribute('slot'))
                ) return false;
                if (this.queued.indexOf(e) > -1) return false;
                this.queued.push(e);
                discovered.push(e);
            }

            return true;
        }
        const scanChildren = (e: HTMLElement) => {
            for (const element of Array.from(e.children) as HTMLElement[]) {
                if (!checkElement(element)) continue;
                if (element.tagName.toLowerCase() !== 'template')
                    scanChildren(element);
            }
        }
        checkElement(ele);
        scanChildren(ele);

        return discovered;
    }

    async buildTag<T extends Tag>(element: HTMLElement, returnExisting: boolean = false, cls: any = Tag): Promise<T> {
        if (element[Tag.TaggedVariable]) {
            this.removedQueued(element);
            return returnExisting ? element[Tag.TaggedVariable] : null;
        }
        if (element.tagName.toLowerCase() === 'slot')
            cls = SlotTag;
        else if (element.hasAttribute('slot'))
            cls = SlottedTag;

        const tag: T = new cls(element, this);
        this.tags.push(tag as any);
        tag.once('deconstruct', this.removeTag, this);
        return tag;
    }

    protected removeTag(tag: Tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1)
            this.tags.splice(index, 1);
    }

    async setupTags(tags: Tag[]) {
         // Configure, setup & execute attributes
        for (const tag of tags)
            await tag.buildAttributes();

        for (const tag of tags)
            await tag.compileAttributes();

        for (const tag of tags)
            await tag.setupAttributes();

        for (const tag of tags)
            await tag.extractAttributes();

        for (const tag of tags)
            await tag.connectAttributes();

        for (const tag of tags) {
            await tag.finalize();
            this.removedQueued(tag.element)
        }

        for (const tag of tags) {
            this.observer.observe(tag.element, {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true
            });
        }
    }

    removedQueued(element: HTMLElement) {
        const index = this.queued.indexOf(element);
        if (index > -1)
            this.queued.splice(index, 1);
    }

    async buildFrom(ele: any, isRoot: boolean = false, forComponent: boolean = false): Promise<Tag[]> {
        if (isRoot) {
            this.rootElement.setAttribute('vsn-root', '');
            this._root = await this.buildTag(this.rootElement, true);
            this._root.createScope(true);
            await this.setupTags([this._root]);
        }

        // Setup components first
        const templateNodes = this.querySelectorElement(ele, 'template');
        const components: Tag[] = [];
        for (const n of Array.from(templateNodes) as HTMLElement[]) {
            if (!ElementHelper.hasVisionAttribute(n))
                continue;

            const tag = await this.buildTag(n);
            if (tag)
                components.push(tag);
        }
        if (components.length)
            await this.setupTags(components);

        // Create tags for each html element with a vsn-attribute
        const newTags: Tag[] = [];
        const toBuild: HTMLElement[] = await this.discover(ele, forComponent);

        for (const element of toBuild) {
            const tag = await this.buildTag(element);
            if (tag)
                newTags.push(tag);
        }

        await this.setupTags(newTags);

        if (isRoot) {
            this._built = true;
            this.dispatch('builtRoot')
        }
        this.dispatch('built', newTags);
        return newTags;
    }

    addGarbage(garbage: Scope | Tag) {
        if (garbage instanceof Scope) {
            this.scopesToDeconstruct.push(garbage);
        } else if (garbage instanceof Tag) {
            this.tagsToDeconstruct.push(garbage);
        }
    }

    cleanup() {
        for (const tag of this.tagsToDeconstruct) {
            if (tag.state !== TagState.Deconstructed)
                tag.deconstruct();
        }
        this.tagsToDeconstruct.length = 0;

        for (const scope of this.scopesToDeconstruct) {
            scope.deconstruct();
        }
        this.tagsToDeconstruct.length = 0;
    }

    async getTagsForElements(elements: Element[], create: boolean = false) {
        const tags: TagList = new TagList();
        const found: Element[] = [];

        for (const element of elements) {
            if (element && element[Tag.TaggedVariable]) {
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
        if (element && element[Tag.TaggedVariable])
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
            if (tag.uniqueScope && tag.scope === scope)
                return tag;
        }

        return null;
    }

    public async resetBranch(e: Tag | HTMLElement) {
        if (e instanceof Tag)
            e = e.element;

        const tag: Tag = e[Tag.TaggedVariable];
        if (tag) {
            tag.findParentTag();
        }

        const children = Array.from(e.children) as HTMLElement[]
        for (const t of children) {
            await this.resetBranch(t);
        }
    }

    public static getParentElement(element: HTMLElement): HTMLElement {
        if (element.parentElement) {
            return element.parentElement as HTMLElement;
        } else if (element.assignedSlot) {
            return element.assignedSlot.parentElement as HTMLElement;
        } else if (element['shadowParent']) {
            return element['shadowParent'];
        }
        return null;
    }
}
