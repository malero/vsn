import { Node } from "./Node";
import { Token, TokenType, TreeNode } from "../AST";
import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
export declare class XHRNode extends Node implements TreeNode {
    readonly left: Node | null;
    readonly requestType: TokenType;
    readonly url: Node;
    constructor(left: Node | null, requestType: TokenType, url: Node);
    getChildNodes(): Node[];
    protected _evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    static parse(node: Node, token: Token, tokens: Token[]): XHRNode;
    static match(tokens: Token[]): boolean;
}
