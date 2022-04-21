import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { Token, TokenType, TreeNode } from "../AST";
import { Node } from "./Node";
export declare class ArithmeticNode extends Node implements TreeNode {
    readonly left: TreeNode;
    readonly right: TreeNode;
    readonly type: TokenType;
    constructor(left: TreeNode, right: TreeNode, type: TokenType);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static match(tokens: Token[]): boolean;
    static parse(lastNode: any, token: any, tokens: Token[]): ArithmeticNode;
}
