import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { ConditionalNode } from "./ConditionalNode";
export declare class IfStatementNode extends Node implements TreeNode {
    protected nodes: ConditionalNode[];
    constructor(nodes: ConditionalNode[]);
    protected _getChildNodes(): Node[];
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static parseConditional(tokens: Token[]): ConditionalNode;
    static parse(lastNode: any, token: any, tokens: Token[]): IfStatementNode;
}
