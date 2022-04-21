import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TokenType, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class ComparisonNode extends Node implements TreeNode {
    readonly left: Node;
    readonly right: Node;
    readonly type: TokenType;
    constructor(left: Node, right: Node, type: TokenType);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<boolean>;
    static match(tokens: Token[]): boolean;
    static parse(lastNode: any, token: any, tokens: Token[]): ComparisonNode;
}
