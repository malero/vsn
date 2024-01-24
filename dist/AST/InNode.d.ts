import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class InNode extends Node implements TreeNode {
    readonly left: TreeNode;
    readonly right: TreeNode;
    readonly flip: boolean;
    constructor(left: TreeNode, right: TreeNode, flip?: boolean);
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<boolean>;
    protected _getChildNodes(): Node[];
    static match(tokens: Token[]): boolean;
    static parse(lastNode: any, token: any, tokens: Token[]): InNode;
}
