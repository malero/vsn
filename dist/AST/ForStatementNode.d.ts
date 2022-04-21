import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { LiteralNode } from "./LiteralNode";
import { RootScopeMemberNode } from "./RootScopeMemberNode";
import { ScopeMemberNode } from "./ScopeMemberNode";
export declare class ForStatementNode extends Node implements TreeNode {
    readonly variable: LiteralNode<string>;
    readonly list: RootScopeMemberNode | ScopeMemberNode;
    readonly block: RootScopeMemberNode | ScopeMemberNode;
    constructor(variable: LiteralNode<string>, list: RootScopeMemberNode | ScopeMemberNode, block: RootScopeMemberNode | ScopeMemberNode);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static parse(lastNode: any, token: any, tokens: Token[]): ForStatementNode;
}
