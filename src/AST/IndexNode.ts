import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";

export class IndexNode extends Node implements TreeNode {
    constructor(
        public readonly object: Node,
        public readonly index: Node,
        public readonly indexTwo: Node = null
    ) {
        super();
        console.log('index node', object, index, indexTwo);
    }

    protected _getChildNodes(): Node[] {
        const children = [
            this.object,
            this.index
        ];
        if (this.indexTwo)
            children.push(this.indexTwo);

        return children;
    }

    public negativeIndex(obj: any[], index: number | string): number | string {
        if (Number.isFinite(index) && index < 0)
            return obj.length + (index as number);
        return index;
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const obj = await this.object.evaluate(scope, dom, tag);
        const index: string | number = this.negativeIndex(obj, await this.index.evaluate(scope, dom, tag));

        if (Number.isFinite(index) && this.indexTwo) {
            const indexTwo: number = this.negativeIndex(obj, await this.indexTwo.evaluate(scope, dom, tag)) as number;
            const values = [];
            for (let i: number = index as number; i <= indexTwo; i++) {
                values.push(obj[i]);
            }
            return values;
        } else {
            if (obj instanceof Scope) {
                return obj.get(index as string);
            }
            return (obj)[index];
        }
    }

    public static match(tokens: Token[]): boolean {
        return tokens[0].type === TokenType.L_BRACKET;
    }

    public static parse(lastNode, token, tokens: Token[]): IndexNode {
        const valueTokens: Token[][] = Tree.getBlockTokens(tokens, TokenType.COLON);
        const values: Node[] = [];
        for (const arg of valueTokens) {
            values.push(Tree.processTokens(arg));
        }
        return new IndexNode(lastNode, values[0], values.length > 1 && values[1]);
    }
}