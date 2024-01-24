import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TreeNode } from "../AST";
import { Modifiers } from "../Modifiers";
export interface INodeMeta {
    [key: string]: string | number | boolean | null;
}
export declare abstract class Node implements TreeNode {
    protected requiresPrep: boolean;
    protected _isPreparationRequired: boolean;
    protected childNodes: Node[];
    protected nodeCache: {
        [key: string]: Node[];
    };
    readonly modifiers: Modifiers;
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    isPreparationRequired(): boolean;
    prepare(scope: Scope, dom: DOM, tag?: Tag, meta?: INodeMeta): Promise<void>;
    cleanup(scope: Scope, dom: DOM, tag: Tag): Promise<void>;
    protected _getChildNodes(): Node[];
    getChildNodes(): Node[];
    findChildrenByType<T = Node>(t: any): T[];
    findChildrenByTypes<T = Node>(types: any[], cacheKey?: string): T[];
    hasModifier(modifier: string): boolean;
    static moveModifiers(from: Token[], to?: Token[]): Token[];
}
