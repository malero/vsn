import { Scope } from "./Scope";
import { DOM } from "./DOM";
import { TagList } from "./Tag/List";
export interface Token {
    type: TokenType;
    value: string;
}
export declare enum BlockType {
    BRACE = 0,
    BRACKET = 1,
    PAREN = 2,
    STATEMENT = 3
}
export declare enum TokenType {
    WHITESPACE = 0,
    TYPE_INT = 1,
    TYPE_UINT = 2,
    TYPE_FLOAT = 3,
    TYPE_STRING = 4,
    RETURN = 5,
    OF = 6,
    IN = 7,
    FOR = 8,
    IF = 9,
    ELSE_IF = 10,
    ELSE = 11,
    NAME = 12,
    L_BRACE = 13,
    R_BRACE = 14,
    L_BRACKET = 15,
    R_BRACKET = 16,
    L_PAREN = 17,
    R_PAREN = 18,
    TILDE = 19,
    PERIOD = 20,
    COMMA = 21,
    COLON = 22,
    SEMI_COLON = 23,
    STRING_LITERAL = 24,
    NUMBER_LITERAL = 25,
    BOOLEAN_LITERAL = 26,
    NULL_LITERAL = 27,
    STRICT_EQUALS = 28,
    STRICT_NOT_EQUALS = 29,
    EQUALS = 30,
    NOT_EQUALS = 31,
    GREATER_THAN_EQUAL = 32,
    LESS_THAN_EQUAL = 33,
    GREATER_THAN = 34,
    LESS_THAN = 35,
    ASSIGN = 36,
    AND = 37,
    OR = 38,
    ADD = 39,
    SUBTRACT = 40,
    MULTIPLY = 41,
    DIVIDE = 42,
    ADD_ASSIGN = 43,
    SUBTRACT_ASSIGN = 44,
    MULTIPLY_ASSIGN = 45,
    DIVIDE_ASSIGN = 46,
    EXCLAMATION_POINT = 47,
    ELEMENT_REFERENCE = 48,
    ELEMENT_ATTRIBUTE = 49,
    ELEMENT_QUERY = 50
}
export interface TreeNode<T = any> {
    evaluate(scope: Scope, dom: DOM): any;
    prepare(scope: Scope, dom: DOM): any;
}
export declare abstract class Node implements TreeNode {
    protected requiresPrep: boolean;
    protected _isPreparationRequired: boolean;
    protected childNodes: Node[];
    protected nodeCache: {
        [key: string]: Node[];
    };
    abstract evaluate(scope: Scope, dom: DOM): any;
    isPreparationRequired(): boolean;
    prepare(scope: Scope, dom: DOM): Promise<void>;
    protected _getChildNodes(): Node[];
    getChildNodes(): Node[];
    findChildrenByType<T = Node>(t: any): T[];
    findChildrenByTypes<T = Node>(types: any[], cacheKey?: string): T[];
}
export declare class BlockNode extends Node implements TreeNode {
    readonly statements: Node[];
    constructor(statements: Node[]);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM): Promise<any>;
}
declare class LiteralNode<T = any> extends Node implements TreeNode {
    readonly value: T;
    constructor(value: T);
    evaluate(scope: Scope, dom: DOM): Promise<T>;
}
declare class ScopeMemberNode extends Node implements TreeNode {
    readonly scope: TreeNode<Scope>;
    readonly name: TreeNode<string>;
    constructor(scope: TreeNode<Scope>, name: TreeNode<string>);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM): Promise<any>;
}
declare class RootScopeMemberNode<T = any> extends Node implements TreeNode {
    readonly name: TreeNode<string>;
    constructor(name: TreeNode<string>);
    protected _getChildNodes(): Node[];
    evaluate(scope: Scope, dom: DOM): Promise<any>;
}
declare class ElementQueryNode extends Node implements TreeNode {
    readonly query: string;
    protected requiresPrep: boolean;
    constructor(query: string);
    evaluate(scope: Scope, dom: DOM): Promise<TagList>;
    prepare(scope: Scope, dom: DOM): Promise<void>;
}
declare class ElementAttributeNode extends Node implements TreeNode {
    readonly elementRef: ElementQueryNode;
    readonly attr: string;
    protected requiresPrep: boolean;
    constructor(elementRef: ElementQueryNode, attr: string);
    get name(): LiteralNode<string>;
    protected _getChildNodes(): Node[];
    get attributeName(): string;
    evaluate(scope: Scope, dom: DOM): Promise<any>;
    prepare(scope: Scope, dom: DOM): Promise<void>;
}
export interface IBlockInfo {
    type: BlockType;
    open: TokenType;
    close: TokenType;
    openCharacter: string;
    closeCharacter: string;
}
export declare const AttributableNodes: (typeof ScopeMemberNode | typeof RootScopeMemberNode | typeof ElementAttributeNode)[];
export declare class Tree {
    readonly code: string;
    protected static cache: {
        [key: string]: Node;
    };
    protected rootNode: Node;
    constructor(code: string);
    parse(): void;
    evaluate(scope: Scope, dom: DOM): Promise<any>;
    prepare(scope: Scope, dom: DOM): Promise<void>;
    bindToScopeChanges(scope: any, fnc: any): Promise<void>;
    static tokenize(code: string): Token[];
    static stripWhiteSpace(tokens: Token[]): Token[];
    static processTokens(tokens: Token[]): BlockNode;
    static toCode(tokens: Token[], limit?: any): string;
    static getBlockInfo(tokens: Token[]): IBlockInfo;
    static getNextStatementTokens(tokens: Token[], consumeClosingToken?: boolean, consumeOpeningToken?: boolean, includeClosingToken?: boolean): Token[];
    static getBlockTokens(tokens: Token[], groupBy?: TokenType | null): Token[][];
    static getTokensUntil(tokens: Token[], terminator?: TokenType, consumeTerminator?: boolean, includeTerminator?: boolean, validIfTerminatorNotFound?: boolean): Token[];
    static consumeTypes(tokens: Token[], types: TokenType[]): Token[];
}
export {};
