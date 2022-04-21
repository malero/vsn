import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { Node } from "./Node";
export declare class LiteralNode<T = any> extends Node implements TreeNode {
    readonly value: T;
    constructor(value: T);
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<T>;
}
