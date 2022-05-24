import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {BlockType, Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {BlockNode} from "./BlockNode";
import {Registry} from "../Registry";

export class ClassNode extends Node implements TreeNode {
    public static readonly classes: {[name: string]: ClassNode} = {};
    protected requiresPrep: boolean = true;
    public readonly classScope: Scope = new Scope();

    constructor(
        public readonly name: string,
        public readonly block: BlockNode
    ) {
        super();
    }

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null): Promise<void> {
        if (ClassNode.classes[this.name]) return; // Don't re-prepare same classes
        ClassNode.classes[this.name] = this;
        await this.block.prepare(this.classScope, dom, tag);
        Registry.class(this);
    }

    public async prepareTag(tag: Tag, dom: DOM) {
        tag.createScope(true);
        await this.block.prepare(tag.scope, dom, tag);
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
        const name = nameParts.join('');
        tokens.splice(0, nameParts.length);
        const block = Tree.processTokens(Tree.getNextStatementTokens(tokens, true, true));
        return new ClassNode(name, block);
    }
}
