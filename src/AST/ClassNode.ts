import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {BlockNode} from "./BlockNode";
import {Registry} from "../Registry";
import {OnNode} from "./OnNode";
import {FunctionNode} from "./FunctionNode";

export class ClassNode extends Node implements TreeNode {
    public static readonly classes: {[name: string]: ClassNode} = {};
    protected requiresPrep: boolean = true;
    public readonly classScope: Scope = new Scope();
    protected _ready: boolean = false;

    constructor(
        public readonly name: string,
        public readonly block: BlockNode
    ) {
        super();
    }

    public updateMeta(meta?: any) {
        meta = meta || {};
        meta['ClassNode'] = this;
        return meta;
    }

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta?: any): Promise<void> {
        meta = meta || {};
        meta['ClassNodePrepare'] = true;
        if (ClassNode.classes[this.name]) return; // Don't re-prepare same classes
        ClassNode.classes[this.name] = this;
        await this.block.prepare(this.classScope, dom, tag, meta);
        Registry.class(this);

        for (const element of Array.from(dom.querySelectorAll(`.${this.name}`))) {
            await ClassNode.checkForClassChanges(element as HTMLElement, dom, element[Tag.TaggedVariable] || null);
        }
    }

    public async prepareTag(tag: Tag, dom: DOM, hasConstructor: boolean | null = null) {
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
        tag.preppedClasses.push(this.name);
    }

    public async tearDownTag(tag: Tag, dom: DOM, hasDeconstructor: boolean | null = null) {
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
        tag.preppedClasses.splice(tag.preppedClasses.indexOf(this.name), 1);
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
        const name = nameParts.join('').trim();
        tokens.splice(0, nameParts.length);
        const block = Tree.processTokens(Tree.getNextStatementTokens(tokens, true, true));
        return new ClassNode(name, block);
    }

    public static async checkForClassChanges(element: HTMLElement, dom: DOM, tag: Tag = null) {
        const classes: string[] = Array.from(element.classList);
        let addedClasses: string[] = classes.filter(c => Registry.instance.classes.has(c));
        let removedClasses: string[];

        if (!tag) {
            tag = await dom.getTagForElement(element, true);
        }
        addedClasses = addedClasses.filter(c => !tag.preppedClasses.includes(c));
        removedClasses = tag.preppedClasses.filter(c => !classes.includes(c));

        for (const addedClass of addedClasses) {
            const classNode: ClassNode = Registry.instance.classes.getSynchronous(addedClass);
            if (classNode) {
                await classNode.prepareTag(tag, dom);
            }
        }

        for (const removedClass of removedClasses) {
            const classNode: ClassNode = Registry.instance.classes.getSynchronous(removedClass);
            if (classNode) {
                await classNode.tearDownTag(tag, dom);
            }
        }
    }

    public static isClass(cls: string): boolean {
        return !!this.classes[cls];
    }
}
