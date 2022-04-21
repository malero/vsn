import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TagList} from "../Tag/List";
import {TreeNode} from "../AST";
import {Node} from "./Node";
import {ElementQueryNode} from "./ElementQueryNode";
import {LiteralNode} from "./LiteralNode";

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
        if (this.elementRef) {
            tags = await this.elementRef.evaluate(scope, dom, tag);
        } else if (tag) {
            tags = new TagList(tag)
        } else {
            return;
        }

        if (tags.length === 1)
            return tags[0].scope.get(`@${this.attributeName}`);

        return tags.map((tag) => tag.scope.get(`@${this.attributeName}`));
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        if (this.elementRef) {
            await this.elementRef.prepare(scope, dom, tag);
            const tags: TagList = await this.elementRef.evaluate(scope, dom, tag);
            for (const t of tags)
                await t.watchAttribute(this.attributeName);
        } else if(tag) {
            await tag.watchAttribute(this.attributeName);
        }
    }
}
