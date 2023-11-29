import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TagList} from "../Tag/TagList";
import {TreeNode} from "../AST";
import {Node} from "./Node";
import {ElementQueryNode} from "./ElementQueryNode";
import {LiteralNode} from "./LiteralNode";
import {DOMObject} from "../DOM/DOMObject";
import {IndexNode} from "./IndexNode";
import {ScopeMemberNode} from "./ScopeMemberNode";
import {RootScopeMemberNode} from "./RootScopeMemberNode";

export class ElementAttributeNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;

    constructor(
        public readonly elementRef: ElementQueryNode | null,
        public readonly attr: string
    ) {
        super();
    }

    public get name(): LiteralNode<string> {
        return new LiteralNode<string>(`@${this.attributeName}`);
    }

    protected _getChildNodes(): Node[] {
        let nodes = [];
        if (this.elementRef)
            nodes.push(this.elementRef)
        return nodes;
    }

    get attributeName(): string {
        if (this.attr.startsWith('.'))
            return this.attr.substring(2);
        return this.attr.substring(1);
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let tags: TagList;

        if (this.elementRef instanceof ElementQueryNode) {
            tags = await this.elementRef.evaluate(scope, dom, tag, true);
        } else if (this.elementRef as any instanceof IndexNode) {
            const indexResult = await (this.elementRef as any).evaluate(scope, dom, tag, true);
            if (indexResult instanceof TagList) {
                tags = indexResult;
            } else {
                tags = new TagList(indexResult);
            }
        } else if (this.elementRef as any instanceof ScopeMemberNode || this.elementRef as any instanceof RootScopeMemberNode) {
            const scopeEval = await (this.elementRef as any).evaluate(scope, dom, tag, true);
            if (Array.isArray(scopeEval)) {
                tags = scopeEval as any;
            } else {
                tags = new TagList(scopeEval);
            }
        } else if (tag) {
            tags = new TagList(tag)
        } else {
            return;
        }

        if (tags.length === 1) {
            return this.getAttributeScopeValue(tags[0]);
        }

        return tags.map((tag) => this.getAttributeScopeValue(tag));
    }

    async getAttributeScopeValue(tag: Tag | DOMObject): Promise<string> {
        if (!(tag instanceof DOMObject)) {
            return '';
        }

        // Make sure the attribute is being watched
        await tag.watchAttribute(this.attributeName);
        return tag.scope.get(`@${this.attributeName}`) as string;
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta: any = null) {
        if (this.elementRef) {
            await this.elementRef.prepare(scope, dom, tag, meta);
            const tags: any = await this.elementRef.evaluate(scope, dom, tag, true);
            if (tags instanceof TagList) {
                for (const t of tags)
                    await t?.watchAttribute(this.attributeName);
            } else if (tags instanceof DOMObject) {
                await (tags as DOMObject).watchAttribute(this.attributeName);
            }
        } else if (tag) {
            await tag.watchAttribute(this.attributeName);
        }
    }
}
