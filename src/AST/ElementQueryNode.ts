import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";

export class ElementQueryNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;

    constructor(
        public readonly query: string
    ) {
        super();
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        tag = tag || await dom.getTagForScope(scope);
        return await dom.get(this.query, true, tag);
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        tag = tag || await dom.getTagForScope(scope);
        await dom.get(this.query, true, tag);
    }
}
