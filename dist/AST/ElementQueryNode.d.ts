import { Scope } from "../Scope";
import { DOM, EQuerySelectDirection } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class ElementQueryNode extends Node implements TreeNode {
    readonly query: string;
    readonly first: boolean;
    readonly direction: EQuerySelectDirection;
    protected requiresPrep: boolean;
    constructor(query: string, first?: boolean, direction?: EQuerySelectDirection);
    evaluate(scope: Scope, dom: DOM, tag?: Tag, forceList?: boolean): Promise<any>;
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
    static parse(lastNode: any, token: any, tokens: Token[]): ElementQueryNode;
}
