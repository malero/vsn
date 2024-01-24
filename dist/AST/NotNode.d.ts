import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class NotNode extends Node implements TreeNode {
    readonly toFlip: Node;
    constructor(toFlip: Node);
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<boolean>;
    protected _getChildNodes(): Node[];
    static parse(lastNode: any, token: any, tokens: Token[]): NotNode;
}
