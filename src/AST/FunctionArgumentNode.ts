import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";

export class FunctionArgumentNode<T = any> extends Node implements TreeNode {
    constructor(
        protected args: Node[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            ...(this.args as Node[])
        ]
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const values: any[] = [];
        for (const arg of this.args) {
            values.push(await arg.evaluate(scope, dom, tag));
        }
        return values;
    }
}
