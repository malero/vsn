
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
    COMMA,
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
        type: TokenType.COMMA,
        pattern: /^,/
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


class FunctionArgumentNode<T = any> implements Node {
    constructor(
        protected args: Node<any>[]
    ) {}

    evaluate(scope: Scope): any[] {
        const values: any[] = [];
        for (const arg of this.args) {
            values.push(arg.evaluate(scope));
        }
        return values;
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
    protected rootNode: Node;
    constructor(
        public readonly code: string
    ) {
        const tokens = tokenize(code);
        this.rootNode = Tree.processTokens(tokens);
    }

    evaluate(scope: Scope) {
        return this.rootNode.evaluate(scope);
    }

    public static processTokens(tokens: Token[]): Node {
        let current: number = 0;
        let node: Node = null;
        let count: number = 0;

        while (tokens.length > 0) {
            count++;
            if (count > 1000) break; // Limit to 1000 iterations while in development
            const token: Token = tokens[current];
            if (token.type === TokenType.NAME) {
                node = new RootScopeMemberNode<string>(
                    new LiteralNode<string>(token.value)
                );
                tokens.splice(0, 1);
            } else if (token.type === TokenType.STRING_LITERAL) {
                node = new LiteralNode(token.value);
            } else if (token.type === TokenType.NUMBER_LITERAL) {
                node = new NumberLiteralNode(token.value);
            } else if (token.type === TokenType.PERIOD && tokens[current + 1].type === TokenType.NAME) {
                node = new ScopeMemberNode(
                    node,
                    new LiteralNode<string>(tokens[current + 1].value)
                );
                tokens.splice(0, 2);
            } else if (tokens[0].type === TokenType.L_PAREN) {
                const funcArgs: Token[][] = Tree.getFunctionArgumentTokens(tokens);
                const nodes: Node[] = [];
                for (const arg of funcArgs) {
                    nodes.push(Tree.processTokens(arg));

                }
                node = new FunctionCallNode(
                    node,
                    new FunctionArgumentNode(nodes)
                );
            }
        }

        return node;
    }

    public static getFunctionArgumentTokens(tokens: Token[]): Token[][] {
        let openParens: number = 0;
        const args: Token[][] = [];
        let arg: Token[] = [];
        for (let i: number = 0; i < tokens.length; i++) {
            const token: Token = tokens[i];
            if (token.type === TokenType.L_PAREN) {
                openParens += 1;
                if (openParens > 1)
                    arg.push(token);
            } else if (token.type === TokenType.R_PAREN) {
                openParens -= 1;
                if (openParens > 0)
                    arg.push(token);
            } else if (token.type === TokenType.COMMA && openParens == 1) {
                args.push(arg);
                arg = [];
            } else if (token.type !== TokenType.WHITESPACE) {
                arg.push(token);
            }

            // Consume token
            tokens.splice(0, 1);
            i--;

            if (openParens === 0) {
                args.push(arg);

                return args;
            }
        }
        throw Error('Invalid Syntax, missing )');
    }
}
