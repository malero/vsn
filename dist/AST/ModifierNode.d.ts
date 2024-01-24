import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { BlockNode } from "./BlockNode";
export declare class ModifierNode extends Node implements TreeNode {
    readonly name: string;
    readonly block: BlockNode;
    constructor(name: string, block: BlockNode);
    prepare(scope: Scope, dom: DOM, tag?: Tag, meta?: any): Promise<void>;
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static parse(lastNode: any, token: any, tokens: Token[]): Node;
}
