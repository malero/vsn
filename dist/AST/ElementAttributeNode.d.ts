import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { TreeNode } from "../AST";
import { Node } from "./Node";
import { ElementQueryNode } from "./ElementQueryNode";
import { LiteralNode } from "./LiteralNode";
export declare class ElementAttributeNode extends Node implements TreeNode {
    readonly elementRef: ElementQueryNode | null;
    readonly attr: string;
    protected requiresPrep: boolean;
    constructor(elementRef: ElementQueryNode | null, attr: string);
    get name(): LiteralNode<string>;
    protected _getChildNodes(): Node[];
    get attributeName(): string;
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    prepare(scope: Scope, dom: DOM, tag?: Tag, meta?: any): Promise<void>;
}
