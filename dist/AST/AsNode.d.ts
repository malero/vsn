import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class AsNode extends Node implements TreeNode {
    readonly context: Node;
    readonly name: string;
    constructor(context: Node, name: string);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static parse(lastNode: any, token: any, tokens: Token[]): AsNode;
}
