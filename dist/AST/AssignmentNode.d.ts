import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
import { DOMObject } from "../DOM/DOMObject";
import { Token, TokenType, TreeNode } from "../AST";
import { Node } from "./Node";
import { RootScopeMemberNode } from "./RootScopeMemberNode";
import { ScopeMemberNode } from "./ScopeMemberNode";
export declare class AssignmentNode extends Node implements TreeNode {
    readonly left: RootScopeMemberNode | ScopeMemberNode;
    readonly right: TreeNode;
    readonly type: TokenType;
    constructor(left: RootScopeMemberNode | ScopeMemberNode, right: TreeNode, type: TokenType);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<any>;
    handle(name: any, left: any, right: any, localScope: any): any;
    handleNumber(key: any, left: any, right: any, scope: any): any;
    handleString(key: any, left: any, right: any, scope: any): any;
    handleUnit(key: any, left: any, right: any, scope: any): any;
    handleDOMObject(key: string, dom: DOM, scope: Scope, domObject: DOMObject, tag: Tag): Promise<any>;
    handleArray(key: any, left: any, right: any, scope: any): any;
    static match(tokens: Token[]): boolean;
    static parse(lastNode: any, token: any, tokens: Token[]): AssignmentNode;
}
