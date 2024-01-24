import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { BlockNode } from "./BlockNode";
import { LiteralNode } from "./LiteralNode";
declare type StackContext = {
    block: BlockNode;
    scope: Scope;
    dom: DOM;
    tag: Tag;
};
export declare class NamedStackNode extends Node implements TreeNode {
    readonly stackName: LiteralNode<string>;
    readonly statements: BlockNode;
    protected requiresPrep: boolean;
    protected static stacks: {
        [key: string]: StackContext[];
    };
    protected static executions: string[];
    constructor(stackName: LiteralNode<string>, statements: BlockNode);
    protected _getChildNodes(): Node[];
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    static execute(stackName: string): Promise<boolean>;
    static parse(lastNode: any, token: any, tokens: Token[]): NamedStackNode;
}
export {};
