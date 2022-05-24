import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { BlockNode } from "./BlockNode";
export declare class ClassNode extends Node implements TreeNode {
    readonly name: string;
    readonly block: BlockNode;
    protected requiresPrep: boolean;
    constructor(name: string, block: BlockNode);
    protected _getChildNodes(): Node[];
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<(...args: any[]) => Promise<void>>;
    static parse(lastNode: any, token: any, tokens: Token[]): ClassNode;
}
