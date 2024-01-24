import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TagList} from "../Tag/TagList";
import {TreeNode} from "../AST";
import {Node} from "./Node";
import {ElementQueryNode} from "./ElementQueryNode";
import {LiteralNode} from "./LiteralNode";
import {DOMObject} from "../DOM/DOMObject";

export class ElementStyleNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;

    constructor(
        public readonly elementRef: ElementQueryNode | null,
        public readonly attr: string
    ) {
        super();
    }

    public get name(): LiteralNode<string> {
        return new LiteralNode<string>(`$${this.attributeName}`);
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

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let tags: TagList;
        if (this.elementRef) {
            tags = await this.elementRef.evaluate(scope, dom, tag, true);
        } else if (tag) {
            tags = new TagList(tag)
        } else {
            return;
        }

        if (tags instanceof DOMObject)
            tags = new TagList(tags);

        if (tags.length === 1) {
            return this.getAttributeStyleValue(tags[0]);
        }

        return tags.map((tag) => this.getAttributeStyleValue(tag));
    }

    async getAttributeStyleValue(tag: Tag | DOMObject): Promise<string> {
        // Make sure we're watching the style
        await tag.watchStyle(this.attributeName);
        return tag.scope.get(`$${this.attributeName}`);
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null, meta: any = null) {
        if (this.elementRef) {
            await this.elementRef.prepare(scope, dom, tag, meta);
            const tags: TagList = await this.elementRef.evaluate(scope, dom, tag, true);
            for (const t of tags)
                await t.watchStyle(this.attributeName);
        } else if(tag) {
            await tag.watchStyle(this.attributeName);
        }
    }
}
