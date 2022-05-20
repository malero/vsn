import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { LiteralNode } from "./LiteralNode";
import { RootScopeMemberNode } from "./RootScopeMemberNode";
import { ScopeMemberNode } from "./ScopeMemberNode";
export declare class FunctionNode extends Node implements TreeNode {
    readonly name: LiteralNode<string>;
    readonly variables: LiteralNode<string>[];
    readonly block: RootScopeMemberNode | ScopeMemberNode;
    constructor(name: LiteralNode<string>, variables: LiteralNode<string>[], block: RootScopeMemberNode | ScopeMemberNode);
    protected _getChildNodes(): Node[];
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    static parse(lastNode: any, token: any, tokens: Token[]): FunctionNode;
}
