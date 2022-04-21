import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";

export abstract class Node implements TreeNode {
    protected requiresPrep: boolean = false;
    protected _isPreparationRequired: boolean;
    protected childNodes: Node[];
    protected nodeCache: {[key: string]: Node[]} = {};
    abstract evaluate(scope: Scope, dom: DOM, tag?: Tag);

    isPreparationRequired(): boolean {
        if (this.requiresPrep)
            return true;

        if (this._isPreparationRequired !== undefined)
            return this._isPreparationRequired;

        for (const node of this.getChildNodes()) {
            if (node.isPreparationRequired()) {
                this._isPreparationRequired = true;
                return true;
            }
        }

        return false;
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        for (const node of this.getChildNodes()) {
            await node.prepare(scope, dom, tag);
        }
    }

    protected _getChildNodes(): Node[] {
        return [];
    }

    getChildNodes(): Node[] {
        if (this.childNodes === undefined) {
            this.childNodes = this._getChildNodes();
        }
        return this.childNodes;
    }

    findChildrenByType<T = Node>(t: any): T[] {
        return this.findChildrenByTypes([t]);
    }

    findChildrenByTypes<T = Node>(types: any[], cacheKey: string = null): T[] {
        if (cacheKey !== null && this.nodeCache[cacheKey])
            return this.nodeCache[cacheKey] as any;

        const nodes: T[] = [];
        for (const child of this.getChildNodes()) {
            for (const t of types) {
                if (child instanceof t)
                    nodes.push(child as any as T);
                const childNodes: T[] = child.findChildrenByType<T>(t);
                nodes.push(...childNodes);
            }
        }

        if (cacheKey !== null)
            this.nodeCache[cacheKey] = nodes as any;

        return nodes;
    }
}

