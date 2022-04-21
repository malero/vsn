import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { WrappedArray } from "../Scope/WrappedArray";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class ArrayNode extends Node implements TreeNode {
    readonly values: Node[];
    constructor(values: Node[]);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<WrappedArray<any>>;
    static match(tokens: Token[]): boolean;
    static parse(lastNode: any, token: any, tokens: Token[]): ArrayNode;
}
