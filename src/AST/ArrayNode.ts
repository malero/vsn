import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {WrappedArray} from "../Scope/WrappedArray";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";

export class ArrayNode extends Node implements TreeNode {
    constructor(
        public readonly values: Node[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return new Array(...this.values);
    }

    async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const arr: WrappedArray<any> = new WrappedArray();
        for (const val of this.values) {
            arr.push(await val.evaluate(scope, dom, tag));
        }
        return arr;
    }

    public static match(tokens: Token[]): boolean {
        return tokens[0].type === TokenType.L_BRACKET;
    }

    public static parse(lastNode, token, tokens: Token[]): ArrayNode {
        const valueTokens: Token[][] = Tree.getBlockTokens(tokens);
        const values: Node[] = [];
        for (const arg of valueTokens) {
            values.push(Tree.processTokens(arg));
        }
        return new ArrayNode(values);
    }
}
