import {Scope} from "./Scope";
import {DOM} from "./DOM";
import {DOMObject} from "./DOM/DOMObject";
import {TagList} from "./Tag/List";
import {Tag} from "./Tag";

function lower(str: string): string {
    return str ? str.toLowerCase() : null;
}

interface TokenPattern {
    type: TokenType,
    pattern: RegExp
}

export interface Token {
    type: TokenType,
    value: string
}

export enum BlockType {
    BRACE,
    BRACKET,
    PAREN,
    STATEMENT,
}

export enum TokenType {
    WHITESPACE,
    TYPE_INT,
    TYPE_UINT,
    TYPE_FLOAT,
    TYPE_STRING,
    RETURN,
    NOT,
    OF,
    IN,
    FOR,
    IF,
    ELSE_IF,
    ELSE,
    NAME,
    L_BRACE,
    R_BRACE,
    L_BRACKET,
    R_BRACKET,
    L_PAREN,
    R_PAREN,
    TILDE,
    PERIOD,
    COMMA,
    COLON,
    SEMI_COLON,
    STRING_LITERAL,
    NUMBER_LITERAL,
    BOOLEAN_LITERAL,
    NULL_LITERAL,
    STRICT_EQUALS,
    STRICT_NOT_EQUALS,
    EQUALS,
    NOT_EQUALS,
    GREATER_THAN_EQUAL,
    LESS_THAN_EQUAL,
    GREATER_THAN,
    LESS_THAN,
    ASSIGN,
    AND,
    OR,
    ADD,
    SUBTRACT,
    MULTIPLY,
    DIVIDE,
    ADD_ASSIGN,
    SUBTRACT_ASSIGN,
    MULTIPLY_ASSIGN,
    DIVIDE_ASSIGN,
    EXCLAMATION_POINT,
    ELEMENT_REFERENCE,
    ELEMENT_ATTRIBUTE,
    ELEMENT_QUERY
}

const TOKEN_PATTERNS: TokenPattern[] = [
    {
        type: TokenType.WHITESPACE,
        pattern: /^[\s\n\r]+/
    },
    {
        type: TokenType.TYPE_INT,
        pattern: /^int+/
    },
    {
        type: TokenType.TYPE_UINT,
        pattern: /^uint+/
    },
    {
        type: TokenType.TYPE_FLOAT,
        pattern: /^float+/
    },
    {
        type: TokenType.TYPE_STRING,
        pattern: /^string+/
    },
    {
        type: TokenType.BOOLEAN_LITERAL,
        pattern: /^(true|false)/
    },
    {
        type: TokenType.NULL_LITERAL,
        pattern: /^null/
    },
    {
        type: TokenType.RETURN,
        pattern: /^return\s/
    },
    {
        type: TokenType.NOT,
        pattern: /^not\s/
    },
    {
        type: TokenType.OF,
        pattern: /^of\s/
    },
    {
        type: TokenType.IN,
        pattern: /^in\s/
    },
    {
        type: TokenType.FOR,
        pattern: /^for\s/
    },
    {
        type: TokenType.IF,
        pattern: /^if\s/
    },
    {
        type: TokenType.ELSE_IF,
        pattern: /^else if\s/
    },
    {
        type: TokenType.ELSE,
        pattern: /^else\s/
    },
    {
        type: TokenType.ELEMENT_ATTRIBUTE,
        pattern: /^\.@[_a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_REFERENCE,
        pattern: /^#[-_a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_QUERY,
        pattern: /^\?([#.\[\]:,=\-_a-zA-Z0-9*\s]*[\]_a-zA-Z0-9*])/
    },
    {
        type: TokenType.NAME,
        pattern: /^[$_a-zA-Z][_a-zA-Z0-9]*/
    },
    {
        type: TokenType.NUMBER_LITERAL,
        pattern: /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?/i
    },
    {
        type: TokenType.L_BRACE,
        pattern: /^{/
    },
    {
        type: TokenType.R_BRACE,
        pattern: /^}/
    },
    {
        type: TokenType.L_BRACKET,
        pattern: /^\[/
    },
    {
        type: TokenType.R_BRACKET,
        pattern: /^]/
    },
    {
        type: TokenType.L_PAREN,
        pattern: /^\(/
    },
    {
        type: TokenType.R_PAREN,
        pattern: /^\)/
    },
    {
        type: TokenType.TILDE,
        pattern: /^~/
    },
    {
        type: TokenType.PERIOD,
        pattern: /^\./
    },
    {
        type: TokenType.COMMA,
        pattern: /^,/
    },
    {
        type: TokenType.EQUALS,
        pattern: /^==/
    },
    {
        type: TokenType.NOT_EQUALS,
        pattern: /^!=/
    },
    {
        type: TokenType.GREATER_THAN,
        pattern: /^>/
    },
    {
        type: TokenType.LESS_THAN,
        pattern: /^</
    },
    {
        type: TokenType.GREATER_THAN_EQUAL,
        pattern: /^>=/
    },
    {
        type: TokenType.LESS_THAN_EQUAL,
        pattern: /^<=/
    },
    {
        type: TokenType.COLON,
        pattern: /^:/
    },
    {
        type: TokenType.SEMI_COLON,
        pattern: /^;/
    },
    {
        type: TokenType.STRING_LITERAL,
        pattern: /^"([^"]*)"/
    },
    {
        type: TokenType.STRING_LITERAL,
        pattern: /^'([^']*)'/ // Try to make this work: /^(?<!\\)(?:\\\\)*"([^(?<!\\)(?:\\\\)*"]*)(?<!\\)(?:\\\\)*"/
    },
    {
        type: TokenType.AND,
        pattern: /^&&/
    },
    {
        type: TokenType.OR,
        pattern: /^\|\|/
    },
    {
        type: TokenType.ADD_ASSIGN,
        pattern: /^\+=/
    },
    {
        type: TokenType.SUBTRACT_ASSIGN,
        pattern: /^-=/
    },
    {
        type: TokenType.MULTIPLY_ASSIGN,
        pattern: /^\*=/
    },
    {
        type: TokenType.DIVIDE_ASSIGN,
        pattern: /^\/=/
    },
    {
        type: TokenType.ADD,
        pattern: /^\+/
    },
        {
        type: TokenType.SUBTRACT,
        pattern: /^-/
    },
    {
        type: TokenType.MULTIPLY,
        pattern: /^\*/
    },
    {
        type: TokenType.DIVIDE,
        pattern: /^\//
    },
    {
        type: TokenType.ASSIGN,
        pattern: /^=/
    },
    {
        type: TokenType.EXCLAMATION_POINT,
        pattern: /^!/
    }
];


export interface TreeNode<T = any> {
    evaluate(scope: Scope, dom: DOM, tag?: Tag);
    prepare(scope: Scope, dom: DOM, tag?: Tag);
}


export abstract class Node implements TreeNode {
    protected requiresPrep: boolean = false;
    protected _isPreparationRequired: boolean;
    protected childNodes: Node[];
    protected nodeCache: {[key: string]: Node[]} = {};
    abstract evaluate(scope: Scope, dom: DOM, tag?: Tag);

    isPreparationRequired(): boolean {
        if (this.requiresPrep)
            return true;

        if (this._isPreparationRequired !== undefined)
            return this._isPreparationRequired;

        for (const node of this.getChildNodes()) {
            if (node.isPreparationRequired()) {
                this._isPreparationRequired = true;
                return true;
            }
        }

        return false;
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        for (const node of this.getChildNodes()) {
            await node.prepare(scope, dom, tag);
        }
    }

    protected _getChildNodes(): Node[] {
        return [];
    }

    getChildNodes(): Node[] {
        if (this.childNodes === undefined) {
            this.childNodes = this._getChildNodes();
        }
        return this.childNodes;
    }

    findChildrenByType<T = Node>(t: any): T[] {
        return this.findChildrenByTypes([t]);
    }

    findChildrenByTypes<T = Node>(types: any[], cacheKey: string = null): T[] {
        if (cacheKey !== null && this.nodeCache[cacheKey])
            return this.nodeCache[cacheKey] as any;

        const nodes: T[] = [];
        for (const child of this.getChildNodes()) {
            for (const t of types) {
                if (child instanceof t)
                    nodes.push(child as any as T);
                const childNodes: T[] = child.findChildrenByType<T>(t);
                nodes.push(...childNodes);
            }
        }

        if (cacheKey !== null)
            this.nodeCache[cacheKey] = nodes as any;

        return nodes;
    }
}


export class BlockNode extends Node implements TreeNode {
    constructor(
        public readonly statements: Node[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [...(this.statements as Node[])];
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let returnValue: any = null;
        for (let i = 0; i < this.statements.length; i++) {
            returnValue = await this.statements[i].evaluate(scope, dom, tag);
        }
        return returnValue;
    }
}

class ComparisonNode extends Node implements TreeNode {
    constructor(
        public readonly left: Node,
        public readonly right: Node,
        public readonly type: TokenType
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.left as Node,
            this.right as Node
        ];
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const left: any = await this.left.evaluate(scope, dom, tag);
        const right: any = await this.right.evaluate(scope, dom, tag);
        switch (this.type) {
            case TokenType.EQUALS:
                return left === right;
            case TokenType.NOT_EQUALS:
                return left !== right;
            case TokenType.GREATER_THAN:
                return left > right;
            case TokenType.LESS_THAN:
                return left < right;
            case TokenType.GREATER_THAN_EQUAL:
                return left >= right;
            case TokenType.LESS_THAN_EQUAL:
                return left <= right;
        }
    }

    public static match(tokens: Token[]): boolean {
        return [
            TokenType.EQUALS,
            TokenType.NOT_EQUALS,
            TokenType.GREATER_THAN,
            TokenType.LESS_THAN,
            TokenType.GREATER_THAN_EQUAL,
            TokenType.LESS_THAN_EQUAL
        ].indexOf(tokens[0].type) > -1
    }

    public static parse(lastNode, token, tokens: Token[]) {
        tokens.splice(0, 1); // Remove comparison operator
        return new ComparisonNode(lastNode, Tree.processTokens(Tree.getNextStatementTokens(tokens)), token.type)
    }
}

class ConditionalNode extends Node implements TreeNode {
    constructor(
        public readonly condition: Node,
        public readonly block: BlockNode
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.condition as Node,
            this.block as Node
        ];
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const condition = await this.condition.evaluate(scope, dom, tag);
        if (condition) {
            return await this.block.evaluate(scope, dom, tag);
        }
        return null;
    }
}

class IfStatementNode extends Node implements TreeNode {
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
            const uno: boolean = await condition.condition.evaluate(scope, dom, tag);
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

class ForStatementNode extends Node implements TreeNode {
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

class NotNode extends Node implements TreeNode {
    constructor(
        public readonly toFlip: Node
    ) {
        super();
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const flipping = await this.toFlip.evaluate(scope, dom, tag);
        return !flipping;
    }

    protected _getChildNodes(): Node[] {
        return [
            this.toFlip
        ];
    }

    public static parse(lastNode, token, tokens: Token[]) {
        tokens.splice(0, 1); // Remove not operator
        let containedTokens;
        if (tokens[0].type === TokenType.L_PAREN) {
            containedTokens = Tree.getNextStatementTokens(tokens);
        } else {
            containedTokens = Tree.consumeTypes(tokens, [
                TokenType.BOOLEAN_LITERAL,
                TokenType.NUMBER_LITERAL,
                TokenType.STRING_LITERAL,
                TokenType.NAME,
                TokenType.PERIOD
            ]);
        }
        return new NotNode(Tree.processTokens(containedTokens));
    }
}

class InNode extends Node implements TreeNode {
    constructor(
        public readonly left: TreeNode,
        public readonly right: TreeNode,
        public readonly flip: boolean = false
    ) {
        super();
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const toCheck = await this.left.evaluate(scope, dom, tag);
        const array = await this.right.evaluate(scope, dom, tag);

        let inArray = array.indexOf(toCheck) > -1;
        if (this.flip)
            inArray = !inArray;
        return inArray;
    }

    protected _getChildNodes(): Node[] {
        return [
            this.left as Node,
            this.right as Node
        ];
    }

    public static match(tokens: Token[]): boolean {
        return tokens[0].type === TokenType.IN || (tokens[0].type === TokenType.NOT && tokens[1].type === TokenType.IN);
    }

    public static parse(lastNode, token, tokens: Token[]) {
        const flip: boolean = tokens[0].type === TokenType.NOT;
        if (flip)
            tokens.splice(0, 1); // consume not
        tokens.splice(0, 1); // consume in

        const containedTokens = Tree.getNextStatementTokens(tokens, false, false, true);
        return new InNode(lastNode, Tree.processTokens(containedTokens), flip);
    }
}

class LiteralNode<T = any> extends Node implements TreeNode {
    constructor(
        public readonly value: T
    ) {
        super();
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return this.value;
    }
}

class BooleanLiteralNode extends LiteralNode<number> {
    constructor(
        public readonly value: any
    ) {
        super(value);
        this.value = value === 'true';
    }
}

class NumberLiteralNode extends LiteralNode<number> {
    constructor(
        public readonly value: any
    ) {
        super(value);
        if (this.value.indexOf('.') > -1) {
            this.value = parseFloat(this.value)
        } else {
            this.value = parseInt(this.value);
        }
    }
}


class FunctionCallNode<T = any> extends Node implements TreeNode {
    constructor(
        public readonly fnc: TreeNode<(...args: any[]) => any>,
        public readonly args: FunctionArgumentNode<any[]>
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.fnc as Node,
            this.args as Node
        ]
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let functionScope: Scope = scope;
        if (this.fnc instanceof ScopeMemberNode) {
            functionScope = await this.fnc.scope.evaluate(scope, dom, tag);
        }
        const values = await this.args.evaluate(scope, dom, tag);
        return (await this.fnc.evaluate(scope, dom, tag)).call(functionScope.wrapped || functionScope, ...values);
    }
}


class FunctionArgumentNode<T = any> extends Node implements TreeNode {
    constructor(
        protected args: Node[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            ...(this.args as Node[])
        ]
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const values: any[] = [];
        for (const arg of this.args) {
            values.push(await arg.evaluate(scope, dom, tag));
        }
        return values;
    }
}


class ScopeMemberNode extends Node implements TreeNode {
    constructor(
        public readonly scope: TreeNode<Scope>,
        public readonly name: TreeNode<string>
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.scope as Node,
            this.name as Node
        ]
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let scopes = [];
        const values = [];

        if (this.scope instanceof ElementQueryNode) {
            scopes = await this.scope.evaluate(scope, dom, tag);
        } else
            scopes.push(await this.scope.evaluate(scope, dom, tag));

        for (let parent of scopes) {
            if (parent instanceof DOMObject)
                parent = parent.scope;

            if (!parent) {
                throw Error(`Cannot access "${await this.name.evaluate(scope, dom, tag)}" of undefined.`);
            }
            const name = await this.name.evaluate(scope, dom, tag);
            const value: any = parent.get(name, false);
            values.push(value instanceof Scope && value.wrapped || value);
        }
        return values.length === 1 ? values[0] : values;
    }
}


class RootScopeMemberNode<T = any> extends Node implements TreeNode {
    constructor(
        public readonly name: TreeNode<string>
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.name as Node
        ]
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const value = scope.get(await this.name.evaluate(scope, dom, tag));
        return value instanceof Scope && value.wrapped || value;
    }
}

class ArithmeticNode extends Node implements TreeNode {
    constructor(
        public readonly left: TreeNode,
        public readonly right: TreeNode,
        public readonly type: TokenType
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.left as Node,
            this.right as Node
        ]
    }

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const left: any = await this.left.evaluate(scope, dom, tag);
        const right: any = await this.right.evaluate(scope, dom, tag);

        switch (this.type) {
            case TokenType.ADD:
                return left + right;
            case TokenType.SUBTRACT:
                return left - right;
            case TokenType.MULTIPLY:
                return left * right;
            case TokenType.DIVIDE:
                return left / right;
        }
    }

    public static match(tokens: Token[]): boolean {
        return [
            TokenType.ADD,
            TokenType.SUBTRACT,
            TokenType.MULTIPLY,
            TokenType.DIVIDE
        ].indexOf(tokens[0].type) > -1
    }

    public static parse(lastNode, token, tokens: Token[]) {
        tokens.splice(0, 1); // Remove arithmetic operator
        return new ArithmeticNode(lastNode, Tree.processTokens(Tree.getNextStatementTokens(tokens)), token.type)
    }
}

class ArithmeticAssignmentNode extends Node implements TreeNode {
    constructor(
        public readonly left: RootScopeMemberNode,
        public readonly right: TreeNode,
        public readonly type: TokenType
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.left as Node,
            this.right as Node
        ]
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let scopes = [];
        const name: string = await this.left.name.evaluate(scope, dom, tag);

        if (this.left instanceof ScopeMemberNode) {
            const inner = await this.left.scope.evaluate(scope, dom, tag);
            if (this.left.scope instanceof ElementQueryNode) {
                scopes.push(...inner);
            } else {
                scopes.push(inner);
            }
        } else if (this.left instanceof ElementAttributeNode) {
            scopes = await this.left.elementRef.evaluate(scope, dom, tag);
        } else
            scopes.push(scope);

        const values = [];
        for (let localScope of scopes) {
            if (localScope instanceof DOMObject) {
                await this.handleDOMObject(name, dom, localScope, tag);
            } else {
                if (localScope['$wrapped'] && localScope['$scope'])
                    localScope = localScope['$scope'];

                let left: number | Array<any> | string = await this.left.evaluate(localScope, dom, tag);
                let right: number | Array<any> | string = await this.right.evaluate(localScope, dom, tag);

                if (left instanceof Array) {
                    left = this.handleArray(name, left, right, localScope);
                } else if (Number.isFinite(left)) {
                    left = this.handleNumber(name, left, right, localScope);
                } else {
                    left = this.handleString(name, left, right, localScope);
                }

                values.push(left);
            }
        }
        return values.length > 1 ? values : values[0];
    }

    public handleNumber(key, left, right, scope) {
        if (right !== null && !Number.isFinite(right))
            right = parseFloat(`${right}`);

        left = left as number;
        right = right as number;

        switch (this.type) {
            case TokenType.ASSIGN:
                left = right;
                break;
            case TokenType.ADD_ASSIGN:
                left += right;
                break;
            case TokenType.SUBTRACT_ASSIGN:
                left -= right;
                break;
            case TokenType.MULTIPLY_ASSIGN:
                left *= right;
                break;
            case TokenType.DIVIDE_ASSIGN:
                left /= right;
                break;
        }
        scope.set(key, left);
        return left;
    }

    public handleString(key, left, right, scope) {
        switch (this.type) {
            case TokenType.ASSIGN:
                left = right;
                break;
            case TokenType.ADD_ASSIGN:
                left = `${left}${right}`;
                break;
            case TokenType.SUBTRACT_ASSIGN:
                left.replace(right, '');
                break;
            case TokenType.MULTIPLY_ASSIGN:
                left *= right;
                break;
            case TokenType.DIVIDE_ASSIGN:
                left /= right;
                break;
        }

        scope.set(key, left);
        return left;
    }

    public async handleDOMObject(key: string, dom: DOM, domObject: DOMObject, tag: Tag) {
        let left = domObject.scope.get(key);
        let right: number | Array<any> | string = await this.right.evaluate(domObject.scope, dom, tag);
        if (left instanceof Array)
            return this.handleArray(key, left, right, domObject.scope);

        return this.handleString(key, left, right, domObject.scope);
    }

    public handleArray(key, left, right, scope) {
        if (!(right instanceof Array))
            right = [right];
        switch (this.type) {
            case TokenType.ASSIGN:
                left.splice(0, left.length);
                left.push(...right);
                break;
            case TokenType.ADD_ASSIGN:
                left.push(...right);
                break;
            case TokenType.SUBTRACT_ASSIGN:
                for (let i = left.length - 1; i >= 0; i--) {
                    if (right.indexOf(left[i]) > -1) {
                        left.splice(i, 1);
                        i++;
                    }
                }
                break;
            case TokenType.TILDE:
                for (const toggle of right) {
                    const index = left.indexOf(toggle);
                    if (index > -1) {
                        left.splice(index, 1);
                    } else {
                        left.push(toggle);
                    }
                }
                break;
        }

        /*
         We have to trigger a change manually here. Setting the variable on the scope with an array won't trigger
         it since we are modifying values inside of the array instance.
         */
        scope.trigger(`change:${key}`);

        return left;
    }

    public static match(tokens: Token[]): boolean {
        return [
            TokenType.ASSIGN,
            TokenType.ADD_ASSIGN,
            TokenType.SUBTRACT_ASSIGN,
            TokenType.MULTIPLY_ASSIGN,
            TokenType.DIVIDE_ASSIGN,
            TokenType.TILDE,
        ].indexOf(tokens[0].type) > -1;
    }

    public static parse(lastNode: any, token, tokens: Token[]): ArithmeticAssignmentNode {
        if (!(lastNode instanceof RootScopeMemberNode) && !(lastNode instanceof ScopeMemberNode) && !(lastNode instanceof ElementAttributeNode)) {
            throw SyntaxError(`Invalid assignment syntax near ${Tree.toCode(tokens.splice(0, 10))}`);
        }
        tokens.splice(0, 1); // consume =
        const assignmentTokens: Token[] = Tree.getNextStatementTokens(tokens, false, false, true);

        return new ArithmeticAssignmentNode(
            lastNode as RootScopeMemberNode,
            Tree.processTokens(assignmentTokens),
            token.type
        );
    }
}

class IndexNode extends Node implements TreeNode {
    constructor(
        public readonly object: Node,
        public readonly index: Node,
        public readonly indexTwo: Node = null
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        const children = [
            this.object,
            this.index
        ];
        if (this.indexTwo)
            children.push(this.indexTwo);

        return children;
    }

    public negativeIndex(obj: any[], index: number | string): number | string {
        if (Number.isFinite(index) && index < 0)
            return obj.length + (index as number);
        return index;
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const obj = await this.object.evaluate(scope, dom, tag);
        const index: string | number = this.negativeIndex(obj, await this.index.evaluate(scope, dom, tag));

        if (Number.isFinite(index) && this.indexTwo) {
            const indexTwo: number = this.negativeIndex(obj, await this.indexTwo.evaluate(scope, dom, tag)) as number;
            const values = [];
            for (let i: number = index as number; i <= indexTwo; i++) {
                values.push(obj[i]);
            }
            return values;
        } else {
            return (obj)[index];
        }
    }

    public static match(tokens: Token[]): boolean {
        return tokens[0].type === TokenType.L_BRACKET;
    }

    public static parse(lastNode, token, tokens: Token[]): IndexNode {
        const valueTokens: Token[][] = Tree.getBlockTokens(tokens, TokenType.COLON);
        const values: Node[] = [];
        for (const arg of valueTokens) {
            values.push(Tree.processTokens(arg));
        }
        return new IndexNode(lastNode, values[0], values.length > 1 && values[1]);
    }
}

class ArrayNode extends Node implements TreeNode {
    constructor(
        public readonly values: Node[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return new Array(...this.values);
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const arr: any[] = [];
        for (const val of this.values) {
            arr.push(await val.evaluate(scope, dom, tag));
        }
        return arr;
    }

    public static match(tokens: Token[]): boolean {
        return tokens[0].type === TokenType.L_BRACKET;
    }

    public static parse(lastNode, token, tokens: Token[]): ArrayNode {
        const valueTokens: Token[][] = Tree.getBlockTokens(tokens);
        const values: Node[] = [];
        for (const arg of valueTokens) {
            values.push(Tree.processTokens(arg));
        }
        return new ArrayNode(values);
    }
}

class ObjectNode extends Node implements TreeNode {
    constructor(
        public readonly keys: Node[],
        public readonly values: Node[]
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return new Array(...this.values);
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const obj: Scope = new Scope();
        for (let i = 0; i < this.values.length; i++) {
            const key = this.keys[i];
            const val = this.values[i];
            obj.set(await key.evaluate(scope, dom, tag), await val.evaluate(scope, dom, tag));
        }
        return obj;
    }

    public static match(tokens: Token[]): boolean {
        return tokens[0].type === TokenType.L_BRACE;
    }

    public static parse(lastNode, token, tokens: Token[]): ObjectNode {
        const valueTokens: Token[] = Tree.getNextStatementTokens(tokens);
        const keys: Node[] = [];
        const values: Node[] = [];

        while (valueTokens.length > 0) {
            const key: Token[] = Tree.getTokensUntil(valueTokens, TokenType.COLON, false);
            if (valueTokens[0].type !== TokenType.COLON)
                throw Error('Invalid object literal syntax. Expecting :');
            valueTokens.splice(0, 1); // Consume :
            const val: Token[] = Tree.getTokensUntil(valueTokens, TokenType.COMMA, true, false, true);
            keys.push(Tree.processTokens(key));
            values.push(Tree.processTokens(val));
        }
        return new ObjectNode(keys, values);
    }
}

class ElementQueryNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;

    constructor(
        public readonly query: string
    ) {
        super();
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        tag = tag || await dom.getTagForScope(scope);
        return await dom.get(this.query, true, tag);
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        tag = tag || await dom.getTagForScope(scope);
        await dom.get(this.query, true, tag);
    }
}

class ElementAttributeNode extends Node implements TreeNode {
    protected requiresPrep: boolean = true;

    constructor(
        public readonly elementRef: ElementQueryNode,
        public readonly attr: string
    ) {
        super();
    }

    public get name(): LiteralNode<string> {
        return new LiteralNode<string>(`@${this.attributeName}`);
    }

    protected _getChildNodes(): Node[] {
        return [
            this.elementRef
        ]
    }

    get attributeName(): string {
        if (this.attr.startsWith('.'))
            return this.attr.substring(2);
        return this.attr.substring(1);
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        const tags: TagList = await this.elementRef.evaluate(scope, dom, tag);
        if (tags.length === 1)
            return tags[0].scope.get(`@${this.attributeName}`);
        return tags.map((tag) => tag.scope.get(`@${this.attributeName}`));
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        await this.elementRef.prepare(scope, dom, tag);
        const tags: TagList = await this.elementRef.evaluate(scope, dom, tag);
        for (const tag of tags)
            await tag.watchAttribute(this.attributeName);
    }
}

export interface IBlockInfo {
    type: BlockType,
    open: TokenType,
    close: TokenType,
    openCharacter: string,
    closeCharacter: string
}

export const AttributableNodes = [
    RootScopeMemberNode,
    ScopeMemberNode,
    ElementAttributeNode
];

export class Tree {
    protected static cache: {[key: string]: Node} = {};
    protected rootNode: Node;

    constructor(
        public readonly code: string
    ) {
        if (Tree.cache[code]) {
            this.rootNode = Tree.cache[code];
        } else {
            this.parse();
            Tree.cache[code] = this.rootNode;
        }
    }

    public parse() {
        const tokens = Tree.tokenize(this.code);
        this.rootNode = Tree.processTokens(tokens);
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return await this.rootNode.evaluate(scope, dom, tag);
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        if (!this.rootNode.isPreparationRequired())
            return;
        return await this.rootNode.prepare(scope, dom, tag);
    }

    async bindToScopeChanges(scope, fnc, dom: DOM, tag: Tag = null) {
        for (const node of this.rootNode.findChildrenByTypes<ScopeMemberNode | ElementAttributeNode>([RootScopeMemberNode, ScopeMemberNode, ElementAttributeNode], 'ScopeMemberNodes')) {
            let _scope: Scope = scope;
            if (node instanceof ScopeMemberNode)
                _scope = await node.scope.evaluate(scope, dom);
            else if (node instanceof ElementAttributeNode) {
                _scope = (await node.elementRef.evaluate(scope, dom, tag))[0].scope;
            }

            const name = await node.name.evaluate(scope, dom, tag);
            _scope.bind(`change:${name}`, fnc);
        }
    }

    public static tokenize(code: string): Token[] {
        const tokens: Token[] = [];
        if (!code || code.length === 0)
            return tokens;

        let foundToken: boolean;
        do {
            foundToken = false;
            for (const tp of TOKEN_PATTERNS) {
                const match: RegExpMatchArray = tp.pattern.exec(code);
                if (match) {
                    tokens.push({
                        type: tp.type,
                        value: match[match.length - 1]
                    });

                    code = code.substring(match[0].length);
                    foundToken = true;
                    break;
                }
            }
        } while (code.length > 0 && foundToken);

        return tokens;
    }

    public static stripWhiteSpace(tokens: Token[]): Token[] {
        for (let i: number = 0; i < tokens.length; i++) {
            if (tokens[i].type === TokenType.WHITESPACE) {
                tokens.splice(i, 1);
                i--;
            }
        }
        return tokens;
    }

    public static processTokens(tokens: Token[]): BlockNode {
        let blockNodes: Node[] = [];
        let node: Node = null;
        let count: number = 0;

        Tree.stripWhiteSpace(tokens);

        while (tokens.length > 0) {
            count++;
            if (count > 1000) break; // Limit to 1000 iterations while in development

            if (tokens[0].type === TokenType.RETURN)
                tokens.splice(0, 1);

            const token: Token = tokens[0];
            if (token.type === TokenType.NAME) {
                node = new RootScopeMemberNode<string>(
                    new LiteralNode<string>(token.value)
                );
                tokens.splice(0, 1);
            } else if (token.type === TokenType.IF) {
                node = IfStatementNode.parse(node, token, tokens);
                blockNodes.push(node);
                node = null;
            } else if (token.type === TokenType.FOR) {
                node = ForStatementNode.parse(node, token, tokens);
                blockNodes.push(node);
                node = null;
            } else if (token.type === TokenType.STRING_LITERAL) {
                node = new LiteralNode(token.value);
                tokens.splice(0, 1);
            } else if (token.type === TokenType.NUMBER_LITERAL) {
                node = new NumberLiteralNode(token.value);
                tokens.splice(0, 1);
            } else if (tokens[0].type === TokenType.ELEMENT_REFERENCE) {
                node = new ElementQueryNode(tokens[0].value);
                tokens.splice(0, 1);
            } else if (tokens[0].type === TokenType.ELEMENT_QUERY) {
                node = new ElementQueryNode(tokens[0].value);
                tokens.splice(0, 1);
            } else if (tokens[0].type === TokenType.L_BRACKET) {
                if (node) {
                    node = IndexNode.parse(node, token, tokens);
                } else {
                    node = ArrayNode.parse(node, token, tokens);
                }
            } else if (tokens[0].type === TokenType.L_BRACE) {
                node = ObjectNode.parse(node, token, tokens);
            } else if (tokens[0].type === TokenType.ELEMENT_ATTRIBUTE && node instanceof ElementQueryNode) {
                node = new ElementAttributeNode(node, tokens[0].value);
                tokens.splice(0, 1);
            } else if (node !== null && token.type === TokenType.PERIOD && tokens[1].type === TokenType.NAME) {
                node = new ScopeMemberNode(
                    node,
                    new LiteralNode<string>(tokens[1].value)
                );
                tokens.splice(0, 2);
            } else if (tokens[0].type === TokenType.L_PAREN) {
                const funcArgs: Token[][] = Tree.getBlockTokens(tokens);
                const nodes: Node[] = [];
                for (const arg of funcArgs) {
                    nodes.push(Tree.processTokens(arg));
                }
                if (node) {
                    node = new FunctionCallNode(
                        node, // Previous node should be a NAME
                        new FunctionArgumentNode(nodes)
                    );
                } else {
                    node = new BlockNode(nodes);
                }
            } else if (tokens[0].type === TokenType.SEMI_COLON) {
                if (node) {
                    blockNodes.push(node);
                }
                node = null;
                tokens.splice(0, 1);
            } else if (InNode.match(tokens)) {
                node = InNode.parse(node, token, tokens);
            } else if (ComparisonNode.match(tokens)) {
                node = ComparisonNode.parse(node, token, tokens);
            } else if (ArithmeticNode.match(tokens)) {
                node = ArithmeticNode.parse(node, token, tokens);
            } else if (ArithmeticAssignmentNode.match(tokens)) {
                node = ArithmeticAssignmentNode.parse(node, token, tokens);
            } else if (tokens[0].type === TokenType.WHITESPACE) {
                tokens.splice(0, 1);
            } else if (tokens[0].type === TokenType.BOOLEAN_LITERAL) {
                node = new BooleanLiteralNode(tokens[0].value);
                tokens.splice(0, 1);
            } else if (tokens[0].type === TokenType.NULL_LITERAL) {
                node = new LiteralNode(null);
                tokens.splice(0, 1);
            } else if (tokens[0].type === TokenType.EXCLAMATION_POINT) {
                node = NotNode.parse(node, tokens[0], tokens);
            } else {
                let code: string = Tree.toCode(tokens, 10);
                throw Error(`Syntax Error. Near ${code}`);
            }
        }

        if (node) {
            blockNodes.push(node);
        }

        return new BlockNode(blockNodes);
    }

    public static toCode(tokens: Token[], limit?): string {
        let code: string = '';
        limit = limit || tokens.length;
        for (let i = 0; i < limit; i++) {
            if (!tokens[i]) break;
            code += tokens[i].value;
        }

        return code;
    }

    public static getBlockInfo(tokens: Token[]): IBlockInfo {
        let blockType: BlockType;
        const opener = tokens[0];

        if (opener.type === TokenType.L_PAREN)
            blockType = BlockType.PAREN;
        else if (opener.type === TokenType.L_BRACE)
            blockType = BlockType.BRACE;
        else if (opener.type === TokenType.L_BRACKET)
            blockType = BlockType.BRACKET;
        else
            blockType = BlockType.STATEMENT;

        let open: TokenType;
        let close: TokenType;
        let openCharacter: string;
        let closeCharacter: string;

        switch(blockType) {
            case BlockType.PAREN:
                open = TokenType.L_PAREN;
                close = TokenType.R_PAREN;
                openCharacter = '(';
                closeCharacter = ')';
                break;
            case BlockType.BRACE:
                open = TokenType.L_BRACE;
                close = TokenType.R_BRACE;
                openCharacter = '{';
                closeCharacter = '}';
                break;
            case BlockType.BRACKET:
                open = TokenType.L_BRACKET;
                close = TokenType.R_BRACKET;
                openCharacter = '[';
                closeCharacter = ']';
                break;
            default:
                open = null;
                close = TokenType.SEMI_COLON;
                openCharacter = null;
                closeCharacter = ';';
                break;
        }

        return {
            type: blockType,
            open: open,
            close: close,
            openCharacter: openCharacter,
            closeCharacter: closeCharacter
        }
    }

    public static getNextStatementTokens(tokens: Token[], consumeClosingToken: boolean = true, consumeOpeningToken: boolean = true, includeClosingToken: boolean = false): Token[] {
        const blockInfo: IBlockInfo = Tree.getBlockInfo(tokens);

        // Consume opening block token
        if (consumeOpeningToken && tokens[0].type === blockInfo.open) {
            tokens.splice(0, 1);
        }

        return Tree.getTokensUntil(tokens, blockInfo.close, consumeClosingToken, includeClosingToken);
    }

    public static getBlockTokens(tokens: Token[], groupBy: TokenType | null = TokenType.COMMA): Token[][] {
        const blockInfo: IBlockInfo = Tree.getBlockInfo(tokens);
        let openBlocks: number = 0;
        const args: Token[][] = [];
        let arg: Token[] = [];
        for (let i: number = 0; i < tokens.length; i++) {
            const token: Token = tokens[i];
            if (token.type === blockInfo.open) {
                openBlocks += 1;
                if (openBlocks > 1)
                    arg.push(token);
            } else if (token.type === blockInfo.close) {
                openBlocks -= 1;
                if (openBlocks > 0)
                    arg.push(token);
            } else if (groupBy !== null && token.type === groupBy && openBlocks == 1) {
                args.push(arg);
                arg = [];
            } else if (token.type !== TokenType.WHITESPACE) {
                arg.push(token);
            }

            // Consume token
            tokens.splice(0, 1);
            i--;
            if (openBlocks === 0) {
                if (arg.length > 0)
                    args.push(arg);

                return args;
            }
        }
        throw Error(`Invalid Syntax, missing ${blockInfo.closeCharacter}`);
    }

    public static getTokensUntil(tokens: Token[], terminator: TokenType = TokenType.SEMI_COLON, consumeTerminator: boolean = true, includeTerminator: boolean = false, validIfTerminatorNotFound: boolean = false): Token[] {
        const statementTokens: Token[] = [];
        const blockInfo: IBlockInfo = Tree.getBlockInfo(tokens);

        let openParens: number = 0;
        let openBraces: number = 0;
        let openBrackets: number = 0;

        for (let i: number = 0; i < tokens.length; i++) {
            const token: Token = tokens[i];
            if (!(token.type === blockInfo.open && i === 0)) { // Skip opener
                if (token.type === TokenType.L_PAREN)
                    openParens += 1;

                if (token.type === TokenType.L_BRACE)
                    openBraces += 1;

                if (token.type === TokenType.L_BRACKET)
                    openBrackets += 1;
            }

            if ([
                terminator,
                TokenType.R_BRACKET,
                TokenType.R_BRACE,
                TokenType.R_PAREN
            ].indexOf(token.type) > -1) {
                if (openParens > 0 && token.type === TokenType.R_PAREN) {
                    openParens -= 1;
                } else if (openBraces > 0 && token.type === TokenType.R_BRACE) {
                    openBraces -= 1;
                } else if (openBrackets > 0 && token.type === TokenType.R_BRACKET) {
                    openBrackets -= 1;
                } else if (openParens === 0 && openBraces === 0 && openBrackets === 0 && token.type === terminator) {
                    if (includeTerminator)
                        statementTokens.push(token);

                    if ((includeTerminator || consumeTerminator) && token.type !== TokenType.SEMI_COLON)
                        tokens.splice(0, 1); // Consume end of block
                    break;
                } else {
                    if (validIfTerminatorNotFound)
                        break;
                    throw Error(`Invalid syntax, expecting ${terminator}.`)
                }
            }

            statementTokens.push(token);
            tokens.splice(0, 1); // Consume part of statement
            i--;
        }
        return statementTokens;
    }

    static consumeTypes(tokens: Token[], types: TokenType[]): Token[] {
        const matching: Token[] = [];

        for (const token of tokens) {
            if (types.indexOf(token.type) > -1) {
                matching.push(token);
            } else {
                break;
            }
        }
        tokens.splice(0, matching.length);
        return matching;
    }
}
