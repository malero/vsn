import {FunctionScope, Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {BlockNode} from "./BlockNode";

export class FunctionNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;
    protected garbage: FunctionScope[] = [];

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

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta?: any): Promise<void> {
        if (!meta?.ClassNode) // Don't muddle up tag scope if we're in a class
            scope.set(this.name, this);
        await super.prepare(scope, dom, tag, meta);
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return await this.getFunction(scope, dom, tag);
    }

    public async collectGarbage() {
        for (const f of this.garbage) {
            f.collectGarbage();
        }
        this.garbage = [];
    }

    public async getFunction(scope: Scope, dom: DOM, tag: Tag = null, createFunctionScope: boolean = true) {
        const self = this;
        return async (...args) => {
            let functionScope;
            if (createFunctionScope && !(scope instanceof FunctionScope)) {
                functionScope = new FunctionScope(scope);
                self.garbage.push(functionScope);
            } else {
                functionScope = scope;
            }

            for (const arg of this.args) {
                functionScope.set(arg, args.shift());
            }
            return await this.block.evaluate(functionScope, dom, tag);
        }
    }

    public static parse<T = FunctionNode>(lastNode, token, tokens: Token[], cls: any = FunctionNode): T {
        tokens.shift(); // skip 'func'
        const name = tokens.shift();
        const modifiers = this.moveModifiers(tokens);
        const argTokens = Tree.getBlockTokens(tokens);
        const funcArgs: string[] = [];
        for (const t of argTokens) {
            funcArgs.push(t[0].value);
        }
        const block = Tree.processTokens(Tree.getNextStatementTokens(tokens, true, true));
        this.moveModifiers(modifiers, tokens);
        return new cls(name.value, funcArgs, block);
    }
}
