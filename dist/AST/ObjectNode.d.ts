import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class ObjectNode extends Node implements TreeNode {
    readonly keys: Node[];
    readonly values: Node[];
    constructor(keys: Node[], values: Node[]);
    protected _getChildNodes(): Node[];
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<Scope>;
    static match(tokens: Token[]): boolean;
    static parse(lastNode: any, token: any, tokens: Token[]): ObjectNode;
}
