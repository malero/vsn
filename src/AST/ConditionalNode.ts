import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {WrappedArray} from "../Scope/WrappedArray";
import {TreeNode} from "../AST";
import {BlockNode} from "./BlockNode";
import {Node} from "./Node";

export class ConditionalNode extends Node implements TreeNode {
    constructor(
        public readonly condition: Node,
        public readonly block: BlockNode
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.condition as Node,
            this.block as Node
        ];
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const condition = await this.condition.evaluate(scope, dom, tag);
        let evaluation = false;

        if (condition instanceof WrappedArray) {
            evaluation = condition.length > 0;
        } else {
            evaluation = !!condition;
        }

        return evaluation;
    }
}
