import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class ElementQueryNode extends Node implements TreeNode {
    readonly query: string;
    readonly first: boolean;
    readonly global: boolean;
    protected requiresPrep: boolean;
    constructor(query: string, first?: boolean, global?: boolean);
    evaluate(scope: Scope, dom: DOM, tag?: Tag, forceList?: boolean): Promise<any>;
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    static parse(lastNode: any, token: any, tokens: Token[]): ElementQueryNode;
}
