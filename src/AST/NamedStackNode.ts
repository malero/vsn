import {FunctionScope, Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Token, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {BlockNode} from "./BlockNode";
import {LiteralNode} from "./LiteralNode";

type StackContext = {
    block: BlockNode;
    scope: Scope;
    dom: DOM;
    tag: Tag;
}

export class NamedStackNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;
    protected static stacks: { [key: string]: StackContext[] } = {};
    protected static executions: string[] = [];

    constructor(
        public readonly stackName: LiteralNode<string>,
        public readonly statements: BlockNode
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.stackName,
            this.statements
        ]
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        if (scope instanceof FunctionScope) { // NamedStackNode doesn't work with FunctionScope
            scope = scope.parentScope;
        }
        const stackName = await this.stackName.evaluate(scope, dom, tag);
        let execute = false;
        if (!NamedStackNode.stacks[stackName]) {
            NamedStackNode.stacks[stackName] = [];
        }

        if (NamedStackNode.executions.indexOf(stackName) === -1)
            execute = true;

        NamedStackNode.stacks[stackName].push({
            block: this.statements,
            scope: scope,
            dom: dom,
            tag: tag
        });

        if (execute) {
            NamedStackNode.execute(stackName);
        }
    }

    public static async execute(stackName: string): Promise<boolean> {
        if (NamedStackNode.stacks[stackName].length > 0) {
            const stack = NamedStackNode.stacks[stackName].shift();
            if (NamedStackNode.executions.indexOf(stackName) === -1)
                NamedStackNode.executions.push(stackName);

            await stack.block.evaluate(stack.scope, stack.dom, stack.tag);
            if (!(await NamedStackNode.execute(stackName))) {
                NamedStackNode.executions.splice(NamedStackNode.executions.indexOf(stackName), 1);
            }

            return true;
        } else {
            return false;
        }
    }

    public static parse(lastNode, token, tokens: Token[]) {
        tokens.shift(); // Consume stack
        const stackName = tokens.shift();
        const statementTokens = Tree.getNextStatementTokens(tokens);
        return new NamedStackNode(new LiteralNode<string>(stackName.value), Tree.processTokens(statementTokens));
    }
}
