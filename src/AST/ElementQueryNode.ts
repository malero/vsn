import {Scope} from "../Scope";
import {DOM, EQuerySelectDirection} from "../DOM";
import {Tag} from "../Tag";
import {Token, TreeNode} from "../AST";
import {Node} from "./Node";

export class ElementQueryNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;

    constructor(
        public readonly query: string,
        public readonly first: boolean = false,
        public readonly direction: EQuerySelectDirection = EQuerySelectDirection.ALL,
    ) {
        super();
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null, forceList: boolean = false): Promise<any> {
        tag = tag || await dom.getTagForScope(scope);
        const elements = await dom.get(this.query, true, tag, this.direction);
        return this.first && !forceList ? elements[0] : elements;
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta: any = null): Promise<any> {
        tag = tag || await dom.getTagForScope(scope);
        await dom.get(this.query, true, tag);
    }

    public static parse(lastNode, token, tokens: Token[]): ElementQueryNode {
        tokens.shift();
        let first = false;
        let direction = EQuerySelectDirection.ALL;
        if (token.full.startsWith('?>')) {
            direction = EQuerySelectDirection.DOWN;
        } else if (token.full.startsWith('?<')) {
            direction = EQuerySelectDirection.UP;
            first = true;
        }
        return new ElementQueryNode(token.value, first, direction);
    }
}
