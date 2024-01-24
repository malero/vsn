import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { Node } from "./Node";
import { ScopeNodeAbstract } from "./ScopeNodeAbstract";
export declare class ScopeMemberNode extends ScopeNodeAbstract implements TreeNode {
    readonly scope: TreeNode<Scope>;
    readonly name: TreeNode<string>;
    constructor(scope: TreeNode<Scope>, name: TreeNode<string>);
    protected _getChildNodes(): Node[];
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
}
