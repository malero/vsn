import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { ObjectNode } from "./ObjectNode";
import { ElementQueryNode } from "./ElementQueryNode";
export declare class DispatchEventNode extends Node implements TreeNode {
    readonly name: string;
    readonly data: ObjectNode | null;
    readonly bubbles: boolean;
    readonly elementRef: ElementQueryNode | null;
    constructor(name: string, data: ObjectNode | null, bubbles: boolean, elementRef: ElementQueryNode | null);
    protected _getChildNodes(): Node[];
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    static parse(lastNode: any, token: any, tokens: Token[]): DispatchEventNode;
}
