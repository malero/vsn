import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {ObjectNode} from "./ObjectNode";
import {ScopeData} from "../Scope/ScopeData";
import {ElementQueryNode} from "./ElementQueryNode";

export class DispatchEventNode extends Node implements TreeNode {
    constructor(
        public readonly name: string,
        public readonly data: ObjectNode | null,
        public readonly bubbles: boolean = false,
        public readonly elementRef: ElementQueryNode | null,
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        const nodes: Node[] = [];
        if (this.data)
            nodes.push(this.data);
        return nodes;
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let detail = this.data ? (await this.data.evaluate(scope, dom, tag)).objectify : {};
        if (detail instanceof Scope)
            detail = detail.data.getData();
        else if (detail instanceof ScopeData)
            detail = detail.getData();

        let targets: Tag[] = [tag];
        if (this.elementRef) {
            targets = await this.elementRef.evaluate(scope, dom, tag, true);
        }

        for (const target of targets) {
            detail['source'] = target.element;
            target.element.dispatchEvent(new CustomEvent(this.name, {
                bubbles: this.bubbles,
                detail: detail
            }));
        }
    }

    public static parse(lastNode, token, tokens: Token[]) {
        const name = tokens.shift();
        let data: ObjectNode = null;
        if (tokens.length && tokens[0].type === TokenType.L_BRACE) {
            const containedTokens = Tree.getNextStatementTokens(tokens, false, false, true);
            data = Tree.processTokens(containedTokens).statements[0] as ObjectNode;
        }
        const elementRef = lastNode instanceof ElementQueryNode ? lastNode : null;
        return new DispatchEventNode(name.value, data, name.full.startsWith('!!!'), elementRef);
    }
}
