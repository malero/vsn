import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {INodeMeta, Node} from "./Node";
import {BlockNode} from "./BlockNode";
import {Registry} from "../Registry";
import {OnNode} from "./OnNode";
import {FunctionNode} from "./FunctionNode";

export class ClassNode extends Node implements TreeNode {
    public static readonly ClassesVariable = '_vsn_classes';
    public static readonly classes: {[name: string]: ClassNode} = {};
    public static readonly classParents: {[name: string]: string[]} = {};
    public static readonly classChildren: {[name: string]: string[]} = {}; // List of child class selectors for a given class selector
    public static readonly preppedTags: {[name: string]: Tag[]} = {};

    protected requiresPrep: boolean = true;
    public readonly classScope: Scope = new Scope();
    protected _fullSelector: string;

    constructor(
        public readonly selector: string,
        public readonly block: BlockNode
    ) {
        super();
    }

    public get fullSelector(): string {
        return this._fullSelector;
    }

    public updateMeta(meta?: any) {
        meta = meta || {};
        meta['ClassNode'] = this;
        return meta;
    }

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta?: INodeMeta): Promise<void> {
        meta = Object.assign({}, meta) || {};
        const initial = !!meta['initial'];
        meta['ClassNodePrepare'] = initial;

        // Only prepare once during the initial prep, all subsequent prepares are on tag class blocks
        if (initial) {
            if (meta['ClassNodeSelector']) {
                ClassNode.classChildren[meta['ClassNodeSelector'] as string].push(this.selector);
                meta['ClassNodeSelector'] = `${meta['ClassNodeSelector']} ${this.selector}`;
            } else {
                meta['ClassNodeSelector'] = this.selector;
            }

            this._fullSelector = meta['ClassNodeSelector'];
            if (ClassNode.classes[this._fullSelector]) return; // Don't re-prepare same classes
            ClassNode.classes[this._fullSelector] = this;
            ClassNode.classChildren[this._fullSelector] = [];
            ClassNode.preppedTags[this._fullSelector] = [];

            if (ClassNode.classParents[this.selector] === undefined)
                ClassNode.classParents[this.selector] = [];

            ClassNode.classParents[this.selector].push(this._fullSelector);
            await this.block.prepare(this.classScope, dom, tag, meta);
            Registry.class(this);

            for (const element of Array.from(dom.querySelectorAll(this._fullSelector))) {
                await ClassNode.addElementClass(this._fullSelector, element as HTMLElement, dom, element[Tag.TaggedVariable] || null);
            }
        } else {
            await this.block.prepare(this.classScope, dom, tag, meta);
        }
    }

    public async constructTag(tag: Tag, dom: DOM, hasConstructor: boolean | null = null) {
        if (hasConstructor === null)
            hasConstructor = this.classScope.has('construct');

        tag.createScope(true);
        const meta = this.updateMeta();
        await this.block.prepare(tag.scope, dom, tag, meta);
        if (hasConstructor) {
            const fncCls: FunctionNode = this.classScope.get('construct') as FunctionNode;
            const fnc = await fncCls.getFunction(tag.scope, dom, tag, false);
            await fnc();
        }
        tag.dispatch(`${this.fullSelector}.construct`, tag.element.id);
        ClassNode.preppedTags[this.fullSelector].push(tag);
        ClassNode.addPreparedClassToElement(tag.element, this.fullSelector);
    }

    public async deconstructTag(tag: Tag, dom: DOM, hasDeconstructor: boolean | null = null) {
        if (hasDeconstructor === null)
            hasDeconstructor = this.classScope.has('deconstruct');

        if (hasDeconstructor) {
            const fncCls: FunctionNode = this.classScope.get('deconstruct') as FunctionNode;
            const fnc = await fncCls.getFunction(tag.scope, dom, tag, false);
            await fnc();
        }
        for (const key of this.classScope.keys) {
            if (this.classScope.get(key) instanceof OnNode) {
                const on = this.classScope.get(key) as OnNode;
                tag.removeContextEventHandlers(on);
            }
        }
        tag.dispatch(`${this.fullSelector}.deconstruct`);
        ClassNode.preppedTags[this.fullSelector].splice(ClassNode.preppedTags[this.fullSelector].indexOf(tag), 1);
        await ClassNode.removePreparedClassFromElement(tag.element, this.fullSelector);
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return null;
    }

    public static parse(lastNode, token, tokens: Token[]): ClassNode {
        tokens.shift(); // skip 'class'
        const nameParts: string[] = [];
        for (const t of tokens) {
            if (t.type === TokenType.L_BRACE) break;
            nameParts.push(t.value);
        }
        const selector = nameParts.join('').trim();
        tokens.splice(0, nameParts.length);
        const block = Tree.processTokens(Tree.getNextStatementTokens(tokens, true, true));
        return new ClassNode(selector, block);
    }

    public static async checkForClassChanges(element: HTMLElement, dom: DOM, tag: Tag = null) {
        const localSelectors: string[] = [element.tagName.toLowerCase(), ...Array.from(element.classList).map(c => `.${c}`)];
        const fullSelectors: string[] = [...ClassNode.getClassesForElement(element)];
        if (element.id)
            localSelectors.push(`#${element.id}`);

        for (const selector in localSelectors) {
            if (ClassNode.classParents[selector])
                fullSelectors.push(...ClassNode.classParents[selector]);
        }

        if (!tag) {
            tag = await dom.getTagForElement(element, true);
        }

        for (const selector of fullSelectors) {
            const isPrepped = ClassNode.getClassesForElement(element).includes(selector);
            const elements = Array.from(dom.querySelectorAll(selector));
            const inElements = elements.includes(element);
            let changed: boolean = false;

            if (inElements && !isPrepped) {
                await ClassNode.addElementClass(selector, element, dom, tag);
                changed = true;
            } else if (!inElements && isPrepped) {
                await ClassNode.removeElementClass(selector, element, dom, tag);
                changed = true;
            }

            if (changed && ClassNode.classChildren[selector].length > 0) {
                for (const childSelector of ClassNode.classChildren[selector]) {
                    for (const childElement of Array.from(dom.querySelectorAll(childSelector, tag)) as HTMLElement[]) {
                        await ClassNode.checkForClassChanges(childElement, dom, childElement[Tag.TaggedVariable] || null);
                    }
                }
            }

        }
    }

    public static getClassesForElement(element: HTMLElement): string[] {
        if (!element[ClassNode.ClassesVariable])
            element[ClassNode.ClassesVariable] = [];
        return element[ClassNode.ClassesVariable];
    }

    public static addPreparedClassToElement(element: HTMLElement, selector: string) {
        ClassNode.getClassesForElement(element).push(selector);
    }

    public static removePreparedClassFromElement(element: HTMLElement, selector: string) {
        const classes = ClassNode.getClassesForElement(element);
        classes.splice(classes.indexOf(selector), 1);
    }

    public static async addElementClass(selector: string, element: HTMLElement, dom: DOM, tag: Tag = null) {
        const classes = ClassNode.getClassesForElement(element);
        if (classes.includes(selector)) return;

        if (!tag) {
            tag = await dom.getTagForElement(element, true);
        }

        const classNode: ClassNode = Registry.instance.classes.getSynchronous(selector);
        if (classNode) {
            await classNode.constructTag(tag, dom);
        }
    }

    public static async removeElementClass(selector: string, element: HTMLElement, dom: DOM, tag: Tag = null) {
        const classes = ClassNode.getClassesForElement(element);
        if (!classes.includes(selector)) return;

        if (!tag) {
            tag = await dom.getTagForElement(element, true);
        }

        const classNode: ClassNode = Registry.instance.classes.getSynchronous(selector);
        if (classNode) {
            await classNode.deconstructTag(tag, dom);
        }
    }

    public static isClass(cls: string): boolean {
        return !!this.classes[cls];
    }
}
