
import {Scope} from "./Scope";

interface TokenPattern {
    type: TokenType,
    pattern: RegExp
}

export interface Token {
    type: TokenType,
    value: string
}

export enum TokenType {
    WHITESPACE,
    NAME,
    L_BRACE,
    R_BRACE,
    L_BRACKET,
    R_BRACKET,
    L_PAREN,
    R_PAREN,
    PERIOD,
    COLON,
    SEMI_COLON,
    STRING_LITERAL,
    NUMBER_LITERAL,
    BOOLEAN_LITERAL,
    NULL_LITERAL,
}

const TOKEN_PATTERNS: TokenPattern[] = [
    {
        type: TokenType.WHITESPACE,
        pattern: /^\s+/
    },
    {
        type: TokenType.NAME,
        pattern: /^[_a-zA-Z][_a-zA-Z0-9]*/
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
        type: TokenType.PERIOD,
        pattern: /^\./
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
        pattern: /^'([^']*)'/
    },
    {
        type: TokenType.NUMBER_LITERAL,
        pattern: /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?/i
    },
    {
        type: TokenType.BOOLEAN_LITERAL,
        pattern: /^true|false/
    },
    {
        type: TokenType.NULL_LITERAL,
        pattern: /^null/
    }
];


export function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
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


interface Node<T = any> {
    evaluate(scope: Scope): T;
}


class MemberExpressionNode implements Node {
    constructor(
        protected obj: Node,
        protected name: Node<string>
    ) {}

    public evaluate(scope: Scope): any {
        return this.obj.evaluate(scope)[this.name.evaluate(scope)];
    }
}


class LiteralNode<T> implements Node {
    constructor(
        public readonly value: T
    ) {}

    public evaluate(scope): T {
        return this.value;
    }
}


class StringNode implements Node<string> {
    constructor(
        public readonly node: Node
    ) {}

    public evaluate(scope: Scope): string {
        return `${this.node.evaluate(scope)}`;
    }
}


class FunctionCallNode<T = any> implements Node {
    constructor(
        public readonly fnc: Node<(...args: any[]) => any>,
        public readonly args:  Node<any[]>
    ) {}

    public evaluate(scope: Scope): T {
        return this.fnc.evaluate(scope)(...this.args.evaluate(scope));
    }
}


class ScopeMemberNode implements Node {
    constructor(
        protected scope: Node<Scope>,
        protected name: Node<string>
    ) {}

    evaluate(scope: Scope): Scope {
        return this.scope.evaluate(scope).get(this.name.evaluate(scope));
    }
}


class RootScopeMemberNode<T = any> implements Node {
    constructor(
        protected name: Node<string>
    ) {}

    evaluate(scope: Scope): T {
        return scope.get(this.name.evaluate(scope));
    }
}


export class Tree {
    protected tokens: Token[];
    protected rootNode: Node;
    constructor(
        public readonly code: string
    ) {
        this.tokens = tokenize(code);
        this.rootNode = new MemberExpressionNode(
            new RootScopeMemberNode(new LiteralNode<string>('test')),
            new FunctionCallNode(
                new RootScopeMemberNode(
                    new LiteralNode<string>('func')
                ),
                new LiteralNode<any[]>([])
            )
        );
    }

    evaluate(scope: Scope) {
        return this.rootNode.evaluate(scope);
    }
}
