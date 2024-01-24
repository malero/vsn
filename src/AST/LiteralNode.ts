import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";

export class LiteralNode<T = any> extends Node implements TreeNode {
    constructor(
        public readonly value: T
    ) {
        super();
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return this.value;
    }
}
