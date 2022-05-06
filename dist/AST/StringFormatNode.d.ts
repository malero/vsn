import { Node } from "./Node";
import { Token, TreeNode } from "../AST";
import { Scope } from "../Scope";
import { DOM } from "../DOM";
import { Tag } from "../Tag";
export declare class StringFormatNode extends Node implements TreeNode {
    readonly segments: {
        [key: string]: Node;
    };
    readonly value: string;
    constructor(segments: {
        [key: string]: Node;
    }, value: string);
    getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM, tag?: Tag): Promise<string>;
    static parse(node: Node, token: Token, tokens: Token[]): StringFormatNode;
    static match(tokens: Token[]): boolean;
}
