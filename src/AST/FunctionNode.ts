import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {BlockNode} from "./BlockNode";

export class FunctionNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;

    constructor(
        public readonly name: string,
        public readonly args: string[],
        public readonly block: BlockNode
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.block
        ];
    }

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        scope.set(this.name, async (...args) => {
            const functionScope = new Scope(scope);
            for (const arg of this.args) {
                functionScope.set(arg, args.shift());
            }
            return await this.evaluate(functionScope, dom, tag);
        });
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return await this.block.evaluate(scope, dom, tag);
    }

    public static parse(lastNode, token, tokens: Token[]): FunctionNode {
        tokens.shift(); // skip 'func'
        const name = tokens.shift();
        const argTokens = Tree.getBlockTokens(tokens);
        const funcArgs: string[] = [];
        for (const t of argTokens) {
            funcArgs.push(t[0].value);
        }
        const block = Tree.processTokens(Tree.getBlockTokens(tokens, null)[0]);
        return new FunctionNode(name.value, funcArgs, block);
    }
}
