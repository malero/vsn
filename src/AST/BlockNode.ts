import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";

export class BlockNode extends Node implements TreeNode {
    constructor(
        public readonly statements: Node[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [...(this.statements as Node[])];
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let returnValue: any = null;
        for (let i = 0; i < this.statements.length; i++) {
            returnValue = await this.statements[i].evaluate(scope, dom, tag);
        }
        return returnValue;
    }
}
