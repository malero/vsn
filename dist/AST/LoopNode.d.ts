import { Token, TreeNode } from "../AST";
import { FunctionNode } from "./FunctionNode";
import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
export declare class LoopNode extends FunctionNode implements TreeNode {
    protected looping?: boolean;
    prepare(scope: Scope, dom: DOM, tag: Tag, meta: any): Promise<void>;
    loop(func: any): Promise<void>;
    setTimeout(func: any, time?: number): void;
    static parse<T = LoopNode>(lastNode: any, token: any, tokens: Token[]): T;
}
