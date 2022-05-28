import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { Node } from "./Node";
import { ScopeNodeAbstract } from "./ScopeNodeAbstract";
export declare class RootScopeMemberNode<T = any> extends ScopeNodeAbstract implements TreeNode {
    readonly name: TreeNode<string>;
    constructor(name: TreeNode<string>);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
}
