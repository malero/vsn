import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class IndexNode extends Node implements TreeNode {
    readonly object: Node;
    readonly index: Node;
    readonly indexTwo: Node;
    constructor(object: Node, index: Node, indexTwo?: Node);
    protected _getChildNodes(): Node[];
    negativeIndex(obj: any[], index: number | string): number | string;
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static match(tokens: Token[]): boolean;
    static parse(lastNode: any, token: any, tokens: Token[]): IndexNode;
}
