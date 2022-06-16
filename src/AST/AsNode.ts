import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TreeNode} from "../AST";
import {Node} from "./Node";

export class AsNode extends Node implements TreeNode {
    constructor(
        public readonly context: Node,
        public readonly name: string
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.context
        ]
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const context = await this.context.evaluate(scope, dom, tag);
        scope.set(this.name, context);
        return context;
    }

    public static parse(lastNode, token, tokens: Token[]) {
        tokens.shift(); // Consume as
        const name = tokens.shift();
        return new AsNode(lastNode, name.value);
    }
}
