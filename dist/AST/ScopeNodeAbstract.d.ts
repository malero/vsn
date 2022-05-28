import { Node } from "./Node";
import { TreeNode } from "../AST";
import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
export declare abstract class ScopeNodeAbstract extends Node implements TreeNode {
    applyModifiers(name: string, scope: Scope, dom: DOM, tag: Tag): Promise<void>;
}
