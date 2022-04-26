import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { Node } from "./Node";
export declare class ElementQueryNode extends Node implements TreeNode {
    readonly query: string;
    readonly first: boolean;
    protected requiresPrep: boolean;
    constructor(query: string, first?: boolean);
    evaluate(scope: Scope, dom: DOM, tag?: Tag, forceList?: boolean): Promise<any>;
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
}
