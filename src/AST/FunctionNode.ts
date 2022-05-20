import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TreeNode} from "../AST";
import {Node} from "./Node";
import {LiteralNode} from "./LiteralNode";
import {RootScopeMemberNode} from "./RootScopeMemberNode";
import {ScopeMemberNode} from "./ScopeMemberNode";

export class FunctionNode extends Node implements TreeNode {
    constructor(
        public readonly name: LiteralNode<string>,
        public readonly variables: LiteralNode<string>[],
        public readonly block: RootScopeMemberNode | ScopeMemberNode,
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.block
        ];
    }

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null) {}
    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {}

    public static parse(lastNode, token, tokens: Token[]): FunctionNode {
        return new FunctionNode(null, null, null);
    }
}
