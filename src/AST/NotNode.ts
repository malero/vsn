import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";

export class NotNode extends Node implements TreeNode {
    constructor(
        public readonly toFlip: Node
    ) {
        super();
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const flipping = await this.toFlip.evaluate(scope, dom, tag);
        return !flipping;
    }

    protected _getChildNodes(): Node[] {
        return [
            this.toFlip
        ];
    }

    public static parse(lastNode, token, tokens: Token[]) {
        tokens.splice(0, 1); // Remove not operator
        let containedTokens;
        if (tokens[0].type === TokenType.L_PAREN) {
            containedTokens = Tree.getNextStatementTokens(tokens);
        } else {
            containedTokens = Tree.consumeTypes(tokens, [
                TokenType.BOOLEAN_LITERAL,
                TokenType.NUMBER_LITERAL,
                TokenType.STRING_LITERAL,
                TokenType.NAME,
                TokenType.PERIOD
            ]);
        }
        return new NotNode(Tree.processTokens(containedTokens));
    }
}
