import { Token, TreeNode } from "../AST";
import { FunctionNode } from "./FunctionNode";
import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
export declare class OnNode extends FunctionNode implements TreeNode {
    prepare(scope: Scope, dom: DOM, tag: Tag, meta: any): Promise<void>;
    static parse<T = OnNode>(lastNode: any, token: any, tokens: Token[]): T;
}
