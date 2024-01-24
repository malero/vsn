import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag, TagState} from "../Tag";
import {Token, TokenType, TreeNode} from "../AST";
import {Modifiers} from "../Modifiers";

export interface INodeMeta {
    [key: string]: string | number | boolean | null;
}

export abstract class Node implements TreeNode {
    protected requiresPrep: boolean = false;
    protected _isPreparationRequired: boolean;
    protected childNodes: Node[];
    protected nodeCache: {[key: string]: Node[]} = {};
    public readonly modifiers: Modifiers = new Modifiers();

    async evaluate(scope: Scope, dom: DOM, tag?: Tag) {
        if (scope.isGarbage || (tag && tag.state === TagState.Deconstructed))
            return;
        return await this._evaluate(scope, dom, tag);
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag?: Tag) {}

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

    async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta: INodeMeta = null): Promise<void> {
        for (const node of this.getChildNodes()) {
            await node.prepare(scope, dom, tag, meta);
        }
    }

    async cleanup(scope: Scope, dom: DOM, tag: Tag) {
        for (const node of this.getChildNodes()) {
            await node.cleanup(scope, dom, tag);
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

    hasModifier(modifier: string): boolean {
        return this.modifiers.has(modifier);
    }

    public static moveModifiers(from: Token[], to: Token[] = null): Token[] {
        to = to || [];
        if (from && from.length) {
            while (from[0] && from[0].type == TokenType.MODIFIER) {
                to.unshift(from.shift());
            }
        }
        return to;
    }
}

