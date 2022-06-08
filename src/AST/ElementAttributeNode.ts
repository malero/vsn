import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TagList} from "../Tag/List";
import {TreeNode} from "../AST";
import {Node} from "./Node";
import {ElementQueryNode} from "./ElementQueryNode";
import {LiteralNode} from "./LiteralNode";
import {DOMObject} from "../DOM/DOMObject";
import {IndexNode} from "./IndexNode";

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
        } else if (tag) {
            tags = new TagList(tag)
        } else {
            return;
        }

        if (tags.length === 1)
            return tags[0].scope.get(`@${this.attributeName}`);

        return tags.map((tag) => tag.scope.get(`@${this.attributeName}`));
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
