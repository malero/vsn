import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";

export class RootScopeMemberNode<T = any> extends Node implements TreeNode {
    constructor(
        public readonly name: TreeNode<string>
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.name as Node
        ]
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const name = await this.name.evaluate(scope, dom, tag);
        const value = scope.get(name);
        return value instanceof Scope && value.wrapped || value;
    }
}
