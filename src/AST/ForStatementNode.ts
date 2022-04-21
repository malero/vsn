import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {LiteralNode} from "./LiteralNode";
import {RootScopeMemberNode} from "./RootScopeMemberNode";
import {ScopeMemberNode} from "./ScopeMemberNode";

export class ForStatementNode extends Node implements TreeNode {
    constructor(
        public readonly variable: LiteralNode<string>,
        public readonly list: RootScopeMemberNode | ScopeMemberNode,
        public readonly block: RootScopeMemberNode | ScopeMemberNode,
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.variable,
            this.list,
            this.block
        ];
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const variable: string = await this.variable.evaluate(scope, dom, tag);
        const list: any[] = await this.list.evaluate(scope, dom, tag);
        for (let i = 0;i < list.length; i++) {
            scope.set(variable, list[i]);
            await this.block.evaluate(scope, dom, tag);
        }

        return null;
    }

    public static parse(lastNode, token, tokens: Token[]): ForStatementNode {
        if (tokens[1].type !== TokenType.L_PAREN) {
            throw SyntaxError('Syntax error: Missing (');
        }
        if (tokens[3].type !== TokenType.OF) {
            throw SyntaxError('Syntax error: Missing of');
        }

        tokens.splice(0, 1); // consume for
        const loopDef: Token[] = Tree.getNextStatementTokens(tokens);
        const variableName: Token = loopDef.splice(0, 1)[0];
        loopDef.splice(0, 1); // consume of
        const list: TreeNode = Tree.processTokens(loopDef);
        const block: TreeNode = Tree.processTokens(Tree.getBlockTokens(tokens, null)[0]);

        return new ForStatementNode(
            new LiteralNode<string>(variableName.value),
            list as any,
            block as any
        );
    }
}
