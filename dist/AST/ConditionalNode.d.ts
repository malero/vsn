import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { BlockNode } from "./BlockNode";
import { Node } from "./Node";
export declare class ConditionalNode extends Node implements TreeNode {
    readonly condition: Node;
    readonly block: BlockNode;
    constructor(condition: Node, block: BlockNode);
    protected _getChildNodes(): Node[];
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<boolean>;
}
