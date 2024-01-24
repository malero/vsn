import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";

export class InNode extends Node implements TreeNode {
    constructor(
        public readonly left: TreeNode,
        public readonly right: TreeNode,
        public readonly flip: boolean = false
    ) {
        super();
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const toCheck = await this.left.evaluate(scope, dom, tag);
        const array = await this.right.evaluate(scope, dom, tag);

        let inArray = array.indexOf(toCheck) > -1;
        if (this.flip)
            inArray = !inArray;
        return inArray;
    }

    protected _getChildNodes(): Node[] {
        return [
            this.left as Node,
            this.right as Node
        ];
    }

    public static match(tokens: Token[]): boolean {
        return tokens[0].type === TokenType.IN || (tokens[0].type === TokenType.NOT && tokens[1].type === TokenType.IN);
    }

    public static parse(lastNode, token, tokens: Token[]) {
        const flip: boolean = tokens[0].type === TokenType.NOT;
        if (flip)
            tokens.splice(0, 1); // consume not
        tokens.splice(0, 1); // consume in

        const containedTokens = Tree.getNextStatementTokens(tokens, false, false, true);
        return new InNode(lastNode, Tree.processTokens(containedTokens), flip);
    }
}
