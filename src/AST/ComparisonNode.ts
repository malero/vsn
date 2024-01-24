import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";

export class ComparisonNode extends Node implements TreeNode {
    constructor(
        public readonly left: Node,
        public readonly right: Node,
        public readonly type: TokenType
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.left as Node,
            this.right as Node
        ];
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const left: any = await this.left.evaluate(scope, dom, tag);
        const right: any = await this.right.evaluate(scope, dom, tag);
        switch (this.type) {
            case TokenType.EQUALS:
                return left === right;
            case TokenType.NOT_EQUALS:
                return left !== right;
            case TokenType.GREATER_THAN:
                return left > right;
            case TokenType.LESS_THAN:
                return left < right;
            case TokenType.GREATER_THAN_EQUAL:
                return left >= right;
            case TokenType.LESS_THAN_EQUAL:
                return left <= right;
        }
    }

    public static match(tokens: Token[]): boolean {
        return [
            TokenType.EQUALS,
            TokenType.NOT_EQUALS,
            TokenType.GREATER_THAN,
            TokenType.LESS_THAN,
            TokenType.GREATER_THAN_EQUAL,
            TokenType.LESS_THAN_EQUAL
        ].indexOf(tokens[0].type) > -1
    }

    public static parse(lastNode, token, tokens: Token[]) {
        tokens.splice(0, 1); // Remove comparison operator
        return new ComparisonNode(lastNode, Tree.processTokens(Tree.getNextStatementTokens(tokens)), token.type)
    }
}
