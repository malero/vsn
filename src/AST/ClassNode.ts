import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {BlockNode} from "./BlockNode";

export class ClassNode extends Node implements TreeNode {
    public static readonly classes: {[name: string]: ClassNode} = {};
    protected requiresPrep: boolean = true;
    protected classScope: Scope;

    constructor(
        public readonly name: string,
        public readonly block: BlockNode
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.block
        ];
    }

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null): Promise<void> {
        ClassNode.classes[this.name] = this;
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return null;
    }

    public static parse(lastNode, token, tokens: Token[]): ClassNode {
        tokens.shift(); // skip 'class'
        let name: string = tokens.shift().value;
        const block = Tree.processTokens(Tree.getNextStatementTokens(tokens, true, true));
        return new ClassNode(name, block);
    }
}
