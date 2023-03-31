import {Token, TreeNode} from "../AST";
import {FunctionNode} from "./FunctionNode";
import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";

export class LoopNode extends FunctionNode implements TreeNode {
    protected looping?: boolean = true;

    public async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta): Promise<void> {
        const classPrep = meta?.ClassNodePrepare; // Don't add event handler if we're in class prep
        if (tag && !classPrep) {
            const func = await this.getFunction(tag.scope || scope, dom, tag);
            this.setTimeout(func);
        }
        await super.prepare(scope, dom, tag, meta);
    }

    async loop(func) {
        if (this.looping) {
            await func();
            this.setTimeout(func);
        }
    }

    setTimeout(func, time: number = 33) {
        setTimeout(async () => {
            await this.loop(func);
        }, time);
    }

    public static parse<T = LoopNode>(lastNode, token, tokens: Token[]): T {
        return super.parse<T>(lastNode, token, tokens, LoopNode);
    }
}
