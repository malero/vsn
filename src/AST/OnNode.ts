import {Token, TreeNode} from "../AST";
import {FunctionNode} from "./FunctionNode";
import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";

export class OnNode extends FunctionNode implements TreeNode {
    public async prepare(scope: Scope, dom: DOM, tag: Tag = null): Promise<void> {
        if (tag) {
            tag.addEventHandler(this.name, [], await this.getFunction(scope, dom, tag), this);
        }
        await super.prepare(scope, dom, tag);
    }

    public static parse(lastNode, token, tokens: Token[]): OnNode {
        return super.parse<OnNode>(lastNode, token, tokens, OnNode);
    }
}
