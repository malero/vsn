import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
import { BlockNode } from "./BlockNode";
export declare class ClassNode extends Node implements TreeNode {
    readonly name: string;
    readonly block: BlockNode;
    static readonly classes: {
        [name: string]: ClassNode;
    };
    protected requiresPrep: boolean;
    readonly classScope: Scope;
    constructor(name: string, block: BlockNode);
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    prepareTag(tag: Tag, dom: DOM, hasConstructor?: boolean | null): Promise<void>;
    tearDownTag(tag: Tag, dom: DOM, hasDeconstructor?: boolean | null): Promise<void>;
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static parse(lastNode: any, token: any, tokens: Token[]): ClassNode;
}
