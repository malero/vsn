import {Scope} from "./Scope";
import {DOM} from "./DOM";
import {Tag} from "./Tag";
import {RootScopeMemberNode} from "./AST/RootScopeMemberNode";
import {ScopeMemberNode} from "./AST/ScopeMemberNode";
import {ElementAttributeNode} from "./AST/ElementAttributeNode";
import {Node} from "./AST/Node";
import {BlockNode} from "./AST/BlockNode";
import {LiteralNode} from "./AST/LiteralNode";
import {IfStatementNode} from "./AST/IfStatementNode";
import {ForStatementNode} from "./AST/ForStatementNode";
import {NumberLiteralNode} from "./AST/NumberLiteralNode";
import {ElementQueryNode} from "./AST/ElementQueryNode";
import {IndexNode} from "./AST/IndexNode";
import {ArrayNode} from "./AST/ArrayNode";
import {ObjectNode} from "./AST/ObjectNode";
import {ElementStyleNode} from "./AST/ElementStyleNode";
import {FunctionCallNode} from "./AST/FunctionCallNode";
import {FunctionArgumentNode} from "./AST/FunctionArgumentNode";
import {InNode} from "./AST/InNode";
import {ComparisonNode} from "./AST/ComparisonNode";
import {ArithmeticNode} from "./AST/ArithmeticNode";
import {ArithmeticAssignmentNode} from "./AST/ArithmeticAssignmentNode";
import {UnitLiteralNode} from "./AST/UnitLiteralNode";
import {BooleanLiteralNode} from "./AST/BooleanLiteralNode";
import {NotNode} from "./AST/NotNode";
import {XHRNode} from "./AST/XHRNode";
import {StringFormatNode} from "./AST/StringFormatNode";
import {FunctionNode} from "./AST/FunctionNode";

function lower(str: string): string {
    return str ? str.toLowerCase() : null;
}

interface TokenPattern {
    type: TokenType,
    pattern: RegExp
}

export interface Token {
    type: TokenType,
    value: string,
    full: string,
    groups: string[]
}

export enum BlockType {
    BRACE,
    BRACKET,
    PAREN,
    STATEMENT,
}

export enum TokenType {
    NULL,
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
    FUNC,
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
    SEMICOLON,
    STRING_FORMAT,
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
    ELEMENT_STYLE,
    ELEMENT_QUERY,
    UNIT,
    XHR_GET,
    XHR_POST,
    XHR_PUT,
    XHR_DELETE,
}

const TOKEN_PATTERNS: TokenPattern[] = [
    {
        type: TokenType.WHITESPACE,
        pattern: /^[\s\n\r]+/
    },
    {
        type: TokenType.XHR_POST,
        pattern: /^>>/
    },
    {
        type: TokenType.XHR_PUT,
        pattern: /^<>/
    },
    {
        type: TokenType.XHR_GET,
        pattern: /^<</
    },
    {
        type: TokenType.XHR_DELETE,
        pattern: /^></
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
        type: TokenType.UNIT,
        pattern: /^\d+\.?\d?(?:cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)/
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
        pattern: /^for\s?(?=\()/
    },
    {
        type: TokenType.IF,
        pattern: /^if\s?(?=\()/
    },
    {
        type: TokenType.ELSE_IF,
        pattern: /^else if\s?(?=\()/
    },
    {
        type: TokenType.ELSE,
        pattern: /^else\s?(?=\{)/
    },
    {
        type: TokenType.FUNC,
        pattern: /^func\s/
    },
    {
        type: TokenType.ELEMENT_ATTRIBUTE,
        pattern: /^\.?@[-_a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_STYLE,
        pattern: /^\.?\$[-a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_REFERENCE,
        pattern: /^#[-_a-zA-Z0-9]*/
    },
    {
        type: TokenType.ELEMENT_QUERY,
        pattern: /^\?>?\(([#.\[\]:,=\-_a-zA-Z0-9*\s]*[\]_a-zA-Z0-9*])\)/
    },
    {
        type: TokenType.NAME,
        pattern: /^[_a-zA-Z][_a-zA-Z0-9]*/
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
        type: TokenType.SEMICOLON,
        pattern: /^;/
    },
    {
        type: TokenType.STRING_FORMAT,
        pattern: /^`([^`]*)`/
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
    protected static cache: { [key: string]: Node } = {};
    protected _root: Node;

    constructor(
        public readonly code: string
    ) {
        if (Tree.cache[code]) {
            this._root = Tree.cache[code];
        } else {
            this.parse();
            Tree.cache[code] = this._root;
        }
    }

    public get root(): Node { return this._root; }

    public parse() {
        const tokens = Tree.tokenize(this.code);
        this._root = Tree.processTokens(tokens);
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        return await this._root.evaluate(scope, dom, tag);
    }

    async prepare(scope: Scope, dom: DOM, tag: Tag = null) {
        if (!this._root.isPreparationRequired())
            return;
        return await this._root.prepare(scope, dom, tag);
    }

    async bindToScopeChanges(scope, fnc, dom: DOM, tag: Tag = null) {
        for (const node of this._root.findChildrenByTypes<ScopeMemberNode | ElementAttributeNode>([RootScopeMemberNode, ScopeMemberNode, ElementAttributeNode], 'ScopeMemberNodes')) {
            let _scope: Scope = scope;
            if (node instanceof ScopeMemberNode)
                _scope = await node.scope.evaluate(scope, dom);
            else if (node instanceof ElementAttributeNode && node.elementRef) {
                _scope = (await node.elementRef.evaluate(scope, dom, tag))[0].scope;
            }

            const name = await node.name.evaluate(scope, dom, tag);
            _scope.on(`change:${name}`, fnc);
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
                        value: match[match.length - 1],
                        full: match[0],
                        groups: match
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
                tokens.shift()

            const token: Token = tokens[0];
            if (token.type === TokenType.NAME) {
                node = new RootScopeMemberNode<string>(
                    new LiteralNode<string>(token.value)
                );
                tokens.shift()
            } else if (XHRNode.match(tokens)) {
                node = XHRNode.parse(node, tokens[0], tokens);
            } else if (token.type === TokenType.IF) {
                node = IfStatementNode.parse(node, token, tokens);
                blockNodes.push(node);
                node = null;
            } else if (token.type === TokenType.FOR) {
                node = ForStatementNode.parse(node, token, tokens);
                blockNodes.push(node);
                node = null;
            } else if (token.type === TokenType.FUNC) {
                node = FunctionNode.parse(node, token, tokens);
                blockNodes.push(node);
                node = null;
            } else if (StringFormatNode.match(tokens)) {
                node = StringFormatNode.parse(node, tokens[0], tokens);
            } else if (token.type === TokenType.STRING_LITERAL) {
                node = new LiteralNode(token.value);
                tokens.shift()
            } else if (token.type === TokenType.NUMBER_LITERAL) {
                node = new NumberLiteralNode(token.value);
                tokens.shift()
            } else if (tokens[0].type === TokenType.ELEMENT_REFERENCE) {
                node = new ElementQueryNode(tokens[0].value, true);
                tokens.shift()
            } else if (tokens[0].type === TokenType.ELEMENT_QUERY) {
                node = ElementQueryNode.parse(node, tokens[0], tokens);
            } else if (tokens[0].type === TokenType.L_BRACKET) {
                if (node) {
                    node = IndexNode.parse(node, token, tokens);
                } else {
                    node = ArrayNode.parse(node, token, tokens);
                }
            } else if (tokens[0].type === TokenType.L_BRACE) {
                node = ObjectNode.parse(node, token, tokens);
            } else if (tokens[0].type === TokenType.ELEMENT_ATTRIBUTE) {
                node = new ElementAttributeNode(node as any, tokens[0].value);
                tokens.shift()
            } else if (tokens[0].type === TokenType.ELEMENT_STYLE) {
                node = new ElementStyleNode(node as any, tokens[0].value);
                tokens.shift()
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
            } else if (tokens[0].type === TokenType.SEMICOLON) {
                if (node) {
                    blockNodes.push(node);
                }
                node = null;
                tokens.shift()
            } else if (InNode.match(tokens)) {
                node = InNode.parse(node, token, tokens);
            } else if (ComparisonNode.match(tokens)) {
                node = ComparisonNode.parse(node, token, tokens);
            } else if (ArithmeticNode.match(tokens)) {
                node = ArithmeticNode.parse(node, token, tokens);
            } else if (ArithmeticAssignmentNode.match(tokens)) {
                node = ArithmeticAssignmentNode.parse(node, token, tokens);
            } else if (tokens[0].type === TokenType.WHITESPACE) {
                tokens.shift()
            } else if (tokens[0].type === TokenType.UNIT) {
                node = new UnitLiteralNode(tokens[0].value);
                tokens.shift()
            } else if (tokens[0].type === TokenType.BOOLEAN_LITERAL) {
                node = new BooleanLiteralNode(tokens[0].value);
                tokens.shift()
            } else if (tokens[0].type === TokenType.NULL_LITERAL) {
                node = new LiteralNode(null);
                tokens.shift()
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

        switch (blockType) {
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
                close = TokenType.SEMICOLON;
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
            tokens.shift()
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
            tokens.shift()
            i--;
            if (openBlocks === 0) {
                if (arg.length > 0)
                    args.push(arg);

                return args;
            }
        }
        throw Error(`Invalid Syntax, missing ${blockInfo.closeCharacter}`);
    }

    public static getTokensUntil(tokens: Token[], terminator: TokenType = TokenType.SEMICOLON, consumeTerminator: boolean = true, includeTerminator: boolean = false, validIfTerminatorNotFound: boolean = false, blockInfo: IBlockInfo = null): Token[] {
        const statementTokens: Token[] = [];
        blockInfo = blockInfo || Tree.getBlockInfo(tokens);

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
                } else if (token.type === terminator && openParens === 0 && openBraces === 0 && openBrackets === 0) {
                    if (includeTerminator)
                        statementTokens.push(token);

                    //if (consumeTerminator && token.type !== TokenType.SEMICOLON)
                    if ((includeTerminator || consumeTerminator) && token.type !== TokenType.SEMICOLON)
                        tokens.shift() // Consume end of block
                    break;
                } else if (token.type === terminator && (openParens > 0 || openBraces > 0 || openBrackets > 0)) {
                } else {
                    if (validIfTerminatorNotFound)
                        break;
                    throw Error(`Invalid syntax, expecting ${terminator}.`)
                }
            }

            statementTokens.push(token);
            tokens.shift() // Consume part of statement
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

    static async apply(code: string, scope: Scope, dom: DOM, tag: Tag) {
        const t = new Tree(code);
        return await t.evaluate(scope, dom, tag);
    }
}
