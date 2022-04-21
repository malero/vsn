import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {BlockType, Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";

export class ObjectNode extends Node implements TreeNode {
    constructor(
        public readonly keys: Node[],
        public readonly values: Node[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return new Array(...this.values);
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const obj: Scope = new Scope();
        for (let i = 0; i < this.values.length; i++) {
            const key = this.keys[i];
            const val = this.values[i];
            obj.set(await key.evaluate(scope, dom, tag), await val.evaluate(scope, dom, tag));
        }
        return obj;
    }

    public static match(tokens: Token[]): boolean {
        return tokens[0].type === TokenType.L_BRACE;
    }

    public static parse(lastNode, token, tokens: Token[]): ObjectNode {
        const valueTokens: Token[] = Tree.getNextStatementTokens(tokens);
        const keys: Node[] = [];
        const values: Node[] = [];

        while (valueTokens.length > 0) {
            const key: Token[] = Tree.getTokensUntil(valueTokens, TokenType.COLON, false);
            if (valueTokens[0].type !== TokenType.COLON)
                throw Error('Invalid object literal syntax. Expecting :');
            valueTokens.splice(0, 1); // Consume :
            const val: Token[] = Tree.getTokensUntil(valueTokens, TokenType.COMMA, true, false, true, {
                type: BlockType.STATEMENT,
                open: null,
                close: null,
                openCharacter: null,
                closeCharacter: null
            });
            keys.push(Tree.processTokens(key));
            values.push(Tree.processTokens(val));
        }
        return new ObjectNode(keys, values);
    }
}
