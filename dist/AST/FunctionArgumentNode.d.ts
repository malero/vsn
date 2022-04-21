import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { Node } from "./Node";
export declare class FunctionArgumentNode<T = any> extends Node implements TreeNode {
    protected args: Node[];
    constructor(args: Node[]);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any[]>;
}
