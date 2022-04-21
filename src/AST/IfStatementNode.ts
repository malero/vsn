import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {ConditionalNode} from "./ConditionalNode";
import {LiteralNode} from "./LiteralNode";

export class IfStatementNode extends Node implements TreeNode {
    constructor(
        protected nodes: ConditionalNode[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            ...(this.nodes as Node[])
        ]
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        for (const condition of this.nodes) {
            const uno: boolean = await condition.evaluate(scope, dom, tag);
            if (uno) {
                return await condition.block.evaluate(scope, dom, tag);
            }
        }
    }

    public static parseConditional(tokens: Token[]): ConditionalNode {
        if ([
            TokenType.IF,
            TokenType.ELSE_IF
        ].indexOf(tokens[0].type) === -1)  {
            throw SyntaxError('Invalid Syntax');
        }

        tokens.splice(0, 1); // consume if and else if
        return new ConditionalNode(
            Tree.processTokens(Tree.getBlockTokens(tokens, null)[0]),
            Tree.processTokens(Tree.getBlockTokens(tokens, null)[0])
        );
    }

    public static parse(lastNode, token, tokens: Token[]): IfStatementNode {
        if (tokens[1].type !== TokenType.L_PAREN) {
            throw SyntaxError('If statement needs to be followed by a condition encased in parenthesis.');
        }
        const nodes: ConditionalNode[] = [];
        nodes.push(IfStatementNode.parseConditional(tokens));

        while(tokens.length > 0 && TokenType.ELSE_IF === tokens[0].type) {
            nodes.push(IfStatementNode.parseConditional(tokens));
        }

        if (tokens.length > 0 && TokenType.ELSE === tokens[0].type) {
            tokens.splice(0, 1); // Consume else
            nodes.push(new ConditionalNode(
                new LiteralNode(true),
                Tree.processTokens(Tree.getBlockTokens(tokens, null)[0])
            ))
        }

        return new IfStatementNode(nodes);
    }
}
