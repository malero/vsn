import {
  AssignmentNode,
  BehaviorNode,
  BinaryExpression,
  BlockNode,
  AssignmentTarget,
  CallExpression,
  DeclarationNode,
  DeclarationTarget,
  DeclarationFlags,
  DeclarationFlagArgs,
  DirectiveExpression,
  IdentifierExpression,
  LiteralExpression,
  OnBlockNode,
  ProgramNode,
  QueryExpression,
  SelectorNode,
  StateBlockNode,
  StateEntryNode,
  UnaryExpression,
  ExpressionNode
} from "../ast/nodes";
import { Lexer } from "./lexer";
import { TokenStream } from "./token-stream";
import { TokenType } from "./token";

export class Parser {
  private stream: TokenStream;

  constructor(input: string) {
    const lexer = new Lexer(input);
    this.stream = new TokenStream(lexer.tokenize());
  }

  static parseInline(code: string): BlockNode {
    const parser = new Parser(`{${code}}`);
    return parser.parseInlineBlock();
  }

  parseProgram(): ProgramNode {
    const behaviors: BehaviorNode[] = [];
    this.stream.skipWhitespace();
    while (!this.stream.eof()) {
      behaviors.push(this.parseBehavior());
      this.stream.skipWhitespace();
    }
    return new ProgramNode(behaviors);
  }

  parseInlineBlock(): BlockNode {
    this.stream.skipWhitespace();
    return this.parseBlock({ allowDeclarations: false });
  }

  private parseBehavior(): BehaviorNode {
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Behavior);
    const selector = this.parseSelector();
    const body = this.parseBlock({ allowDeclarations: true });
    return new BehaviorNode(selector, body);
  }

  private parseSelector(): SelectorNode {
    let selectorText = "";
    let sawNonWhitespace = false;

    while (true) {
      const token = this.stream.peek();
      if (!token) {
        break;
      }

      if (token.type === TokenType.LBrace) {
        break;
      }

      if (token.type === TokenType.Whitespace) {
        this.stream.next();
        if (sawNonWhitespace && selectorText[selectorText.length - 1] !== " ") {
          selectorText += " ";
        }
        continue;
      }

      sawNonWhitespace = true;
      selectorText += this.stream.next().value;
    }

    if (!selectorText.trim()) {
      throw new Error("Behavior selector is required");
    }

    return new SelectorNode(selectorText.trim());
  }

  private parseBlock(options?: { allowDeclarations?: boolean }): BlockNode {
    const allowDeclarations = options?.allowDeclarations ?? false;
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LBrace);
    const statements = [];
    let declarationsOpen = allowDeclarations;

    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated block");
      }
      if (next.type === TokenType.RBrace) {
        this.stream.next();
        break;
      }

      const isDeclaration = this.isDeclarationStart();
      if (isDeclaration) {
        if (!allowDeclarations) {
          throw new Error("Declarations are only allowed at the behavior root");
        }
        if (!declarationsOpen) {
          throw new Error("Declarations must appear before blocks");
        }
        statements.push(this.parseDeclaration());
      } else {
        if (declarationsOpen) {
          declarationsOpen = false;
        }
        statements.push(this.parseStatement());
      }
    }

    return new BlockNode(statements);
  }

  private parseStatement() {
    this.stream.skipWhitespace();
    const next = this.stream.peek();
    if (!next) {
      throw new Error("Unexpected end of input");
    }

    if (next.type === TokenType.On) {
      return this.parseOnBlock();
    }

    if (next.type === TokenType.Construct) {
      return this.parseConstructBlock();
    }

    if (next.type === TokenType.Destruct) {
      return this.parseDestructBlock();
    }

    if (next.type === TokenType.Behavior) {
      return this.parseBehavior();
    }

    if (this.isCallStart()) {
      return this.parseExpressionStatement();
    }

    if (this.isAssignmentStart()) {
      return this.parseAssignment();
    }

    throw new Error(`Unexpected token ${next.type}`);
  }

  private parseStateBlock(): StateBlockNode {
    this.stream.expect(TokenType.State);
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LBrace);

    const entries: StateEntryNode[] = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated state block");
      }
      if (next.type === TokenType.RBrace) {
        this.stream.next();
        break;
      }

      const nameToken = this.stream.expect(TokenType.Identifier);
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.Colon);
      this.stream.skipWhitespace();
      const value = this.parseExpression();
      this.stream.skipWhitespace();

      let important = false;
      if (this.stream.peek()?.type === TokenType.Bang) {
        this.stream.next();
        this.stream.skipWhitespace();
        const importantToken = this.stream.next();
        if (importantToken.type === TokenType.Identifier && importantToken.value === "important") {
          important = true;
        } else {
          throw new Error("Expected 'important' after '!'");
        }
      }

      this.stream.skipWhitespace();
      this.stream.expect(TokenType.Semicolon);
      entries.push(new StateEntryNode(nameToken.value, value, important));
    }

    return new StateBlockNode(entries);
  }

  private parseOnBlock(): OnBlockNode {
    this.stream.expect(TokenType.On);
    this.stream.skipWhitespace();
    const event = this.stream.expect(TokenType.Identifier);
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LParen);
    const args: string[] = [];

    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated on() arguments");
      }
      if (next.type === TokenType.RParen) {
        this.stream.next();
        break;
      }
      if (next.type === TokenType.Identifier) {
        args.push(this.stream.next().value);
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.Comma) {
          this.stream.next();
        }
        continue;
      }
      throw new Error(`Unexpected token in on() args: ${next.type}`);
    }

    const body = this.parseBlock({ allowDeclarations: false });
    return new OnBlockNode(event.value, args, body);
  }

  private parseAssignment(): AssignmentNode {
    const target = this.parseAssignmentTarget();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Equals);
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Semicolon);
    return new AssignmentNode(target, value);
  }

  private parseExpression(): ExpressionNode {
    return this.parseAdditiveExpression();
  }

  private parseAdditiveExpression(): ExpressionNode {
    let left = this.parseUnaryExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || (next.type !== TokenType.Plus && next.type !== TokenType.Minus)) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseUnaryExpression();
      this.stream.skipWhitespace();
      left = new BinaryExpression(op.type === TokenType.Plus ? "+" : "-", left, right);
    }
    return left;
  }

  private parseUnaryExpression(): ExpressionNode {
    this.stream.skipWhitespace();
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected expression");
    }
    if (token.type === TokenType.Bang) {
      this.stream.next();
      const argument = this.parseUnaryExpression();
      return new UnaryExpression("!", argument);
    }
    if (token.type === TokenType.Minus) {
      this.stream.next();
      const argument = this.parseUnaryExpression();
      return new UnaryExpression("-", argument);
    }
    return this.parseCallExpression();
  }

  private parseCallExpression(): ExpressionNode {
    let expr = this.parsePrimaryExpression();
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== TokenType.LParen) {
        break;
      }
      this.stream.next();
      const args: ExpressionNode[] = [];
      while (true) {
        this.stream.skipWhitespace();
        const next = this.stream.peek();
        if (!next) {
          throw new Error("Unterminated call expression");
        }
        if (next.type === TokenType.RParen) {
          this.stream.next();
          break;
        }
        args.push(this.parseExpression());
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.Comma) {
          this.stream.next();
          continue;
        }
        if (this.stream.peek()?.type === TokenType.RParen) {
          this.stream.next();
          break;
        }
        throw new Error("Expected ',' or ')' in call arguments");
      }
      expr = new CallExpression(expr, args);
    }
    return expr;
  }

  private parsePrimaryExpression(): ExpressionNode {
    this.stream.skipWhitespace();
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected expression");
    }

    if (token.type === TokenType.At || token.type === TokenType.Dollar) {
      const kind = token.type === TokenType.At ? "attr" : "style";
      this.stream.next();
      const name = this.stream.expect(TokenType.Identifier);
      return new DirectiveExpression(kind, name.value);
    }

    if (token.type === TokenType.Question) {
      return this.parseQueryExpression();
    }

    if (token.type === TokenType.LParen) {
      this.stream.next();
      const value = this.parseExpression();
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.RParen);
      return value;
    }

    if (token.type === TokenType.Identifier) {
      const name = this.parseIdentifierPath();
      return new IdentifierExpression(name);
    }

    if (token.type === TokenType.Boolean) {
      return new LiteralExpression(this.stream.next().value === "true");
    }

    if (token.type === TokenType.Null) {
      this.stream.next();
      return new LiteralExpression(null);
    }

    if (token.type === TokenType.Number) {
      return new LiteralExpression(Number(this.stream.next().value));
    }

    if (token.type === TokenType.String) {
      return new LiteralExpression(this.stream.next().value);
    }

    throw new Error(`Unsupported expression token ${token.type}`);
  }

  private parseAssignmentTarget(): AssignmentTarget {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected assignment target");
    }

    if (token.type === TokenType.At || token.type === TokenType.Dollar) {
      const kind = token.type === TokenType.At ? "attr" : "style";
      this.stream.next();
      const name = this.stream.expect(TokenType.Identifier);
      return new DirectiveExpression(kind, name.value);
    }

    if (token.type === TokenType.Identifier) {
      return new IdentifierExpression(this.parseIdentifierPath());
    }

    throw new Error(`Invalid assignment target ${token.type}`);
  }

  private parseDeclaration(): DeclarationNode {
    const target = this.parseDeclarationTarget();
    this.stream.skipWhitespace();
    const operator = this.parseDeclarationOperator();
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    const { flags, flagArgs } = this.parseFlags();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Semicolon);
    return new DeclarationNode(target, operator, value, flags, flagArgs);
  }

  private parseDeclarationTarget(): DeclarationTarget {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected declaration target");
    }

    if (token.type === TokenType.At || token.type === TokenType.Dollar) {
      const kind = token.type === TokenType.At ? "attr" : "style";
      this.stream.next();
      const name = this.stream.expect(TokenType.Identifier);
      return new DirectiveExpression(kind, name.value);
    }

    if (token.type === TokenType.Identifier) {
      return new IdentifierExpression(this.stream.next().value);
    }

    throw new Error(`Invalid declaration target ${token.type}`);
  }

  private parseDeclarationOperator(): ":" | ":=" | ":<" | ":>" {
    this.stream.expect(TokenType.Colon);
    const next = this.stream.peek();
    if (!next) {
      return ":";
    }
    if (next.type === TokenType.Equals) {
      this.stream.next();
      return ":=";
    }
    if (next.type === TokenType.Less) {
      this.stream.next();
      return ":<";
    }
    if (next.type === TokenType.Greater) {
      this.stream.next();
      return ":>";
    }
    return ":";
  }

  private parseFlags(): { flags: DeclarationFlags; flagArgs: DeclarationFlagArgs } {
    const flags: DeclarationFlags = {};
    const flagArgs: DeclarationFlagArgs = {};

    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== TokenType.Bang) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect(TokenType.Identifier).value;

      if (name === "important") {
        flags.important = true;
      } else if (name === "trusted") {
        flags.trusted = true;
      } else if (name === "debounce") {
        flags.debounce = true;
        if (this.stream.peek()?.type === TokenType.LParen) {
          this.stream.next();
          this.stream.skipWhitespace();
          const numberToken = this.stream.expect(TokenType.Number);
          flagArgs.debounce = Number(numberToken.value);
          this.stream.skipWhitespace();
          this.stream.expect(TokenType.RParen);
        } else {
          flagArgs.debounce = 200;
        }
      } else {
        throw new Error(`Unknown flag ${name}`);
      }
    }

    return { flags, flagArgs };
  }

  private isDeclarationStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first) {
      return false;
    }

    if (first.type === TokenType.Identifier) {
      const second = this.stream.peekNonWhitespace(1);
      return second?.type === TokenType.Colon;
    }

    if (first.type === TokenType.At || first.type === TokenType.Dollar) {
      const second = this.stream.peekNonWhitespace(1);
      const third = this.stream.peekNonWhitespace(2);
      return second?.type === TokenType.Identifier && third?.type === TokenType.Colon;
    }

    return false;
  }

  private isAssignmentStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first) {
      return false;
    }

    if (first.type === TokenType.Identifier) {
      let index = 1;
      while (
        this.stream.peekNonWhitespace(index)?.type === TokenType.Dot &&
        this.stream.peekNonWhitespace(index + 1)?.type === TokenType.Identifier
      ) {
        index += 2;
      }
      return this.stream.peekNonWhitespace(index)?.type === TokenType.Equals;
    }

    if (first.type === TokenType.At || first.type === TokenType.Dollar) {
      const second = this.stream.peekNonWhitespace(1);
      const third = this.stream.peekNonWhitespace(2);
      return second?.type === TokenType.Identifier && third?.type === TokenType.Equals;
    }

    return false;
  }

  private isCallStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== TokenType.Identifier) {
      return false;
    }
    let index = 1;
    while (
      this.stream.peekNonWhitespace(index)?.type === TokenType.Dot &&
      this.stream.peekNonWhitespace(index + 1)?.type === TokenType.Identifier
    ) {
      index += 2;
    }
    return this.stream.peekNonWhitespace(index)?.type === TokenType.LParen;
  }

  private parseExpressionStatement(): ExpressionNode {
    const expr = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Semicolon);
    return expr;
  }

  private parseConstructBlock(): BlockNode {
    this.stream.expect(TokenType.Construct);
    const body = this.parseBlock({ allowDeclarations: false });
    body.type = "Construct";
    return body;
  }

  private parseDestructBlock(): BlockNode {
    this.stream.expect(TokenType.Destruct);
    const body = this.parseBlock({ allowDeclarations: false });
    body.type = "Destruct";
    return body;
  }

  private parseQueryExpression(): QueryExpression {
    this.stream.expect(TokenType.Question);
    let direction: "self" | "descendant" | "ancestor" = "self";

    if (this.stream.peek()?.type === TokenType.Greater) {
      this.stream.next();
      direction = "descendant";
    } else if (this.stream.peek()?.type === TokenType.Less) {
      this.stream.next();
      direction = "ancestor";
    }

    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LParen);
    const selector = this.readSelectorUntil(TokenType.RParen);
    return new QueryExpression(direction, selector);
  }

  private readSelectorUntil(terminator: TokenType): string {
    let selectorText = "";
    let sawNonWhitespace = false;

    while (true) {
      const token = this.stream.peek();
      if (!token) {
        throw new Error("Unterminated selector");
      }
      if (token.type === terminator) {
        this.stream.next();
        break;
      }

      if (token.type === TokenType.Whitespace) {
        this.stream.next();
        if (sawNonWhitespace && selectorText[selectorText.length - 1] !== " ") {
          selectorText += " ";
        }
        continue;
      }

      sawNonWhitespace = true;
      selectorText += this.stream.next().value;
    }

    return selectorText.trim();
  }

  private parseIdentifierPath(): string {
    let value = this.stream.expect(TokenType.Identifier).value;
    while (this.stream.peek()?.type === TokenType.Dot) {
      this.stream.next();
      const part = this.stream.expect(TokenType.Identifier).value;
      value = `${value}.${part}`;
    }
    return value;
  }
}
