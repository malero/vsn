import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { BlockNode } from "./BlockNode";
export declare class WithNode extends Node implements TreeNode {
    readonly context: Node;
    readonly statements: BlockNode;
    protected requiresPrep: boolean;
    constructor(context: Node, statements: BlockNode);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static parse(lastNode: any, token: any, tokens: Token[]): WithNode;
}
