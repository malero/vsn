import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { ObjectNode } from "./ObjectNode";
export declare class DispatchEventNode extends Node implements TreeNode {
    readonly name: string;
    readonly data: ObjectNode | null;
    readonly bubbles: boolean;
    constructor(name: string, data: ObjectNode | null, bubbles?: boolean);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    static parse(lastNode: any, token: any, tokens: Token[]): DispatchEventNode;
}