import {Node} from "./Node";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";

export class StringFormatNode extends Node implements TreeNode {
    constructor(
        public readonly segments: {[key:string]: Node},
        public readonly value: string
    ) {
        super();
    }

    public getChildNodes(): Node[] {
        return this.segments && Object.values(this.segments) || [];
    }

    async evaluate(scope: Scope, dom: DOM, tag?: Tag) {
        let value = this.value;
        for (const key in this.segments) {
            const segment = this.segments[key];
            const segmentValue = await segment.evaluate(scope, dom, tag);
            value = value.replace(`\${${key}}`, segmentValue);
        }
        return value;
    }

    public static parse(node: Node, token: Token, tokens: Token[]): StringFormatNode {
        const segments = {};
        for (const segment of Array.from(new Set(token.value.match(/\$\{([^}]+)}/g)))) {
            const [, code] = segment.split(/\$\{|}/);
            const tree = new Tree(code);
            segments[code] = tree.root;
        }
        tokens.shift();
        return new StringFormatNode(segments, token.value);
    }

    public static match(tokens: Token[]) {
        return tokens[0].type === TokenType.STRING_FORMAT;
    }
}
