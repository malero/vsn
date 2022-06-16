import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {BlockType, Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {BlockNode} from "./BlockNode";
import {TagList} from "../Tag/TagList";

export class WithNode extends Node implements TreeNode {
    constructor(
        public readonly context: Node,
        public readonly statements: BlockNode
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.context,
            this.statements
        ]
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const context = await this.context.evaluate(scope, dom, tag);
        let tags;
        if (context instanceof TagList) {
            tags = context;
        } else if (context instanceof Tag) {
            tags = [context];
        }
        let ret = [];
        for (const _tag of tags) {
            ret.push(await this.statements.evaluate(_tag.scope, dom, _tag))
        }
        return ret.length === 1 ? ret[0] : ret;
    }

    public static parse(lastNode, token, tokens: Token[]) {
        tokens.shift(); // Consume with
        const contextTokens = Tree.getTokensUntil(tokens, TokenType.L_BRACE, false, false, true);
        const statementTokens = Tree.getNextStatementTokens(tokens);
        return new WithNode(Tree.processTokens(contextTokens), Tree.processTokens(statementTokens));
    }
}
