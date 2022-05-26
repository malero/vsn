import {Token, TreeNode} from "../AST";
import {FunctionNode} from "./FunctionNode";
import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";

export class OnNode extends FunctionNode implements TreeNode {
    public async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta): Promise<void> {
        const classPrep = meta?.ClassNodePrepare; // Don't add event handler if we're in class prep
        if (tag && !classPrep)
            tag.addEventHandler(this.name, [], await this.getFunction(scope, dom, tag), this);
        await super.prepare(scope, dom, tag, meta);
    }

    public static parse(lastNode, token, tokens: Token[]): OnNode {
        return super.parse<OnNode>(lastNode, token, tokens, OnNode);
    }
}
