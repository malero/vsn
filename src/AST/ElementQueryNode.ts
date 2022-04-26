import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";

export class ElementQueryNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;

    constructor(
        public readonly query: string,
        public readonly first: boolean = false
    ) {
        super();
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null, forceList: boolean = false): Promise<any> {
        tag = tag || await dom.getTagForScope(scope);
        const elements = await dom.get(this.query, true, tag);
        return this.first && !forceList ? elements[0] : elements;
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        tag = tag || await dom.getTagForScope(scope);
        await dom.get(this.query, true, tag);
    }
}
