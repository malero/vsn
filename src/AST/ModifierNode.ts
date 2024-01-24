import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TreeNode} from "../AST";
import {Node} from "./Node";
import {BlockNode} from "./BlockNode";


export class ModifierNode extends Node implements TreeNode {
    constructor(
        public readonly name: string,
        public readonly block: BlockNode
    ) {
        super();
    }

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta?: any): Promise<void> {
        return null;
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return null;
    }

    public static parse(lastNode, token, tokens: Token[]): Node {
        const modifier = tokens.shift().value.substr(1);
        if (lastNode) {
            lastNode.modifiers.add(modifier);
        }
        return lastNode;
    }
}
