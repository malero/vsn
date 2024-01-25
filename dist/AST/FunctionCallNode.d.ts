import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { Node } from "./Node";
import { FunctionArgumentNode } from "./FunctionArgumentNode";
export declare class FunctionCallNode<T = any> extends Node implements TreeNode {
    readonly fnc: TreeNode<(...args: any[]) => any>;
    readonly args: FunctionArgumentNode<any[]>;
    constructor(fnc: TreeNode<(...args: any[]) => any>, args: FunctionArgumentNode<any[]>);
    protected _getChildNodes(): Node[];
    protected callFunction(func: any, functionScope: any, dom: any, tag: any, ...values: any[]): Promise<[any, boolean]>;
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
}
