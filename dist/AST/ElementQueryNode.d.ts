import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { Node } from "./Node";
export declare class ElementQueryNode extends Node implements TreeNode {
    readonly query: string;
    protected requiresPrep: boolean;
    constructor(query: string);
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<import("../Tag/List").TagList>;
    prepare(scope: Scope, dom: DOM, tag?: Tag): Promise<void>;
}
