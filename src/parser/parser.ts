import {
  AssignmentNode,
  ArrayExpression,
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
  FunctionDeclarationNode,
  FunctionExpression,
  IdentifierExpression,
  LiteralExpression,
  OnBlockNode,
  ProgramNode,
  QueryExpression,
  ReturnNode,
  SelectorNode,
  StateBlockNode,
  StateEntryNode,
  TernaryExpression,
  UnaryExpression,
  UseNode,
  IndexExpression,
  ExpressionNode
} from "../ast/nodes";
import { Lexer } from "./lexer";
import { TokenStream } from "./token-stream";
import { TokenType } from "./token";

export class Parser {
  private stream: TokenStream;
  private source: string;
  private customFlags: Set<string>;

  constructor(input: string, options?: { customFlags?: Set<string> }) {
    this.source = input;
    this.customFlags = options?.customFlags ?? new Set<string>();
    const lexer = new Lexer(input);
    this.stream = new TokenStream(lexer.tokenize());
  }

  static parseInline(code: string): BlockNode {
    const parser = new Parser(`{${code}}`);
    return parser.parseInlineBlock();
  }

  parseProgram(): ProgramNode {
    return this.wrapErrors(() => {
      const behaviors: BehaviorNode[] = [];
      const uses: UseNode[] = [];
      this.stream.skipWhitespace();
      while (!this.stream.eof()) {
        const next = this.stream.peek();
        if (!next) {
          break;
        }
        if (next.type === TokenType.Use) {
          uses.push(this.parseUseStatement());
        } else {
          behaviors.push(this.parseBehavior());
        }
        this.stream.skipWhitespace();
      }
      return new ProgramNode(behaviors, uses);
    });
  }

  parseInlineBlock(): BlockNode {
    return this.wrapErrors(() => {
      this.stream.skipWhitespace();
      return this.parseBlock({ allowDeclarations: false });
    });
  }

  private parseBehavior(): BehaviorNode {
    return this.wrapErrors(() => {
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.Behavior);
      const selector = this.parseSelector();
      const body = this.parseBlock({ allowDeclarations: true });
      return new BehaviorNode(selector, body);
    });
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

  private parseUseStatement(): UseNode {
    return this.wrapErrors(() => {
      this.stream.expect(TokenType.Use);
      this.stream.skipWhitespace();
      const name = this.parseIdentifierPath();
      this.stream.skipWhitespace();
      let alias = name;
      const next = this.stream.peek();
      if (next?.type === TokenType.Identifier && next.value === "as") {
        this.stream.next();
        this.stream.skipWhitespace();
        alias = this.stream.expect(TokenType.Identifier).value;
      }
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.Semicolon);
      return new UseNode(name, alias);
    });
  }

  private wrapErrors<T>(fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      if (error instanceof Error && !/\(line\s+\d+, column\s+\d+\)/i.test(error.message)) {
        throw new Error(this.formatError(error.message));
      }
      throw error;
    }
  }

  private formatError(message: string): string {
    const token = this.stream.peek() ?? this.stream.peekNonWhitespace(0);
    if (!token) {
      return `Parse error: ${message}`;
    }
    const line = token.start.line;
    const column = token.start.column;
    const snippet = this.getLineSnippet(line, column);
    return `Parse error (line ${line}, column ${column}): ${message}\n${snippet}`;
  }

  private getLineSnippet(line: number, column: number): string {
    const lines = this.source.split(/\r?\n/);
    const content = lines[line - 1] ?? "";
    const caret = `${" ".repeat(Math.max(column - 1, 0))}^`;
    return `${content}\n${caret}`;
  }

  private parseBlock(options?: { allowDeclarations?: boolean }): BlockNode {
    const allowDeclarations = options?.allowDeclarations ?? false;
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LBrace);
    const statements = [];
    let declarationsOpen = allowDeclarations;
    let sawConstruct = false;
    let sawFunctionOrOn = false;

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

      const isFunctionDeclaration = allowDeclarations && this.isFunctionDeclarationStart();
      if (isFunctionDeclaration) {
        if (!sawConstruct) {
          sawFunctionOrOn = true;
        }
        statements.push(this.parseFunctionDeclaration());
        continue;
      }
      const isFunctionExpressionAssignment = allowDeclarations && this.isFunctionExpressionAssignmentStart();
      if (isFunctionExpressionAssignment) {
        if (!declarationsOpen) {
          throw new Error("Declarations must appear before blocks");
        }
        statements.push(this.parseAssignment());
        continue;
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
        if (allowDeclarations && next.type === TokenType.On && !sawConstruct) {
          sawFunctionOrOn = true;
        }
        if (allowDeclarations && next.type === TokenType.Construct) {
          if (sawFunctionOrOn) {
            throw new Error("Construct blocks must appear before functions and on blocks");
          }
          sawConstruct = true;
        }
        statements.push(this.parseStatement());
      }
    }

    return new BlockNode(statements);
  }

  private parseStatement(options?: { allowBlocks?: boolean; allowReturn?: boolean }) {
    this.stream.skipWhitespace();
    const next = this.stream.peek();
    if (!next) {
      throw new Error("Unexpected end of input");
    }

    const allowBlocks = options?.allowBlocks ?? true;
    const allowReturn = options?.allowReturn ?? false;

    if (next.type === TokenType.Return) {
      if (!allowReturn) {
        throw new Error("Return is only allowed inside functions");
      }
      return this.parseReturnStatement();
    }

    if (allowBlocks && next.type === TokenType.On) {
      return this.parseOnBlock();
    }

    if (allowBlocks && next.type === TokenType.Construct) {
      return this.parseConstructBlock();
    }

    if (allowBlocks && next.type === TokenType.Destruct) {
      return this.parseDestructBlock();
    }

    if (allowBlocks && next.type === TokenType.Behavior) {
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

    const modifiers = this.parseOnModifiers();
    const body = this.parseBlock({ allowDeclarations: false });
    return new OnBlockNode(event.value, args, body, modifiers);
  }

  private parseOnModifiers(): string[] {
    const modifiers: string[] = [];
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== TokenType.Bang) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect(TokenType.Identifier).value;
      modifiers.push(name);
    }
    return modifiers;
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
    return this.parseTernaryExpression();
  }

  private parseTernaryExpression(): ExpressionNode {
    let test = this.parseLogicalOrExpression();
    this.stream.skipWhitespace();
    if (this.stream.peek()?.type !== TokenType.Question) {
      return test;
    }
    this.stream.next();
    this.stream.skipWhitespace();
    const consequent = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Colon);
    this.stream.skipWhitespace();
    const alternate = this.parseExpression();
    return new TernaryExpression(test, consequent, alternate);
  }

  private parseLogicalOrExpression(): ExpressionNode {
    let left = this.parseLogicalAndExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || next.type !== TokenType.Or) {
        break;
      }
      this.stream.skipWhitespace();
      this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseLogicalAndExpression();
      this.stream.skipWhitespace();
      left = new BinaryExpression("||", left, right);
    }
    return left;
  }

  private parseLogicalAndExpression(): ExpressionNode {
    let left = this.parseEqualityExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || next.type !== TokenType.And) {
        break;
      }
      this.stream.skipWhitespace();
      this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseEqualityExpression();
      this.stream.skipWhitespace();
      left = new BinaryExpression("&&", left, right);
    }
    return left;
  }

  private parseEqualityExpression(): ExpressionNode {
    let left = this.parseComparisonExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || (next.type !== TokenType.DoubleEquals && next.type !== TokenType.NotEquals)) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseComparisonExpression();
      this.stream.skipWhitespace();
      left = new BinaryExpression(op.type === TokenType.DoubleEquals ? "==" : "!=", left, right);
    }
    return left;
  }

  private parseComparisonExpression(): ExpressionNode {
    let left = this.parseAdditiveExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next) {
        break;
      }
      if (next.type !== TokenType.Less &&
          next.type !== TokenType.Greater &&
          next.type !== TokenType.LessEqual &&
          next.type !== TokenType.GreaterEqual) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseAdditiveExpression();
      this.stream.skipWhitespace();
      let operator = "<";
      if (op.type === TokenType.Greater) {
        operator = ">";
      } else if (op.type === TokenType.LessEqual) {
        operator = "<=";
      } else if (op.type === TokenType.GreaterEqual) {
        operator = ">=";
      }
      left = new BinaryExpression(operator, left, right);
    }
    return left;
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
      const next = this.stream.peek();
      if (!next) {
        break;
      }
      if (next.type === TokenType.LParen) {
        this.stream.next();
        const args: ExpressionNode[] = [];
        while (true) {
          this.stream.skipWhitespace();
          const argToken = this.stream.peek();
          if (!argToken) {
            throw new Error("Unterminated call expression");
          }
          if (argToken.type === TokenType.RParen) {
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
        continue;
      }
      if (next.type === TokenType.LBracket) {
        this.stream.next();
        this.stream.skipWhitespace();
        const index = this.parseExpression();
        this.stream.skipWhitespace();
        this.stream.expect(TokenType.RBracket);
        expr = new IndexExpression(expr, index);
        continue;
      }
      break;
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

    if (token.type === TokenType.LBracket) {
      return this.parseArrayExpression();
    }

    if (token.type === TokenType.LParen) {
      if (this.isArrowFunctionStart()) {
        return this.parseArrowFunctionExpression();
      }
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

  private parseArrayExpression(): ExpressionNode {
    this.stream.expect(TokenType.LBracket);
    const elements: ExpressionNode[] = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated array literal");
      }
      if (next.type === TokenType.RBracket) {
        this.stream.next();
        break;
      }
      elements.push(this.parseExpression());
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.Comma) {
        this.stream.next();
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.RBracket) {
          this.stream.next();
          break;
        }
        continue;
      }
      if (this.stream.peek()?.type === TokenType.RBracket) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or ']' in array literal");
    }
    return new ArrayExpression(elements);
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
      } else if (this.customFlags.has(name)) {
        (flags as Record<string, boolean>)[name] = true;
        const customArg = this.parseCustomFlagArg();
        if (customArg !== undefined) {
          (flagArgs as Record<string, any>)[name] = customArg;
        }
      } else {
        throw new Error(`Unknown flag ${name}`);
      }
    }

    return { flags, flagArgs };
  }

  private parseCustomFlagArg(): any {
    if (this.stream.peek()?.type !== TokenType.LParen) {
      return undefined;
    }
    this.stream.next();
    this.stream.skipWhitespace();
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Unterminated flag arguments");
    }
    let value: any;
    if (token.type === TokenType.Number) {
      value = Number(this.stream.next().value);
    } else if (token.type === TokenType.String) {
      value = this.stream.next().value;
    } else if (token.type === TokenType.Boolean) {
      value = this.stream.next().value === "true";
    } else if (token.type === TokenType.Identifier) {
      value = this.stream.next().value;
    } else {
      throw new Error(`Unsupported flag argument ${token.type}`);
    }
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.RParen);
    return value;
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

  private isFunctionDeclarationStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== TokenType.Identifier) {
      return false;
    }
    let index = 1;
    if (this.stream.peekNonWhitespace(index)?.type !== TokenType.LParen) {
      return false;
    }
    index += 1;
    let depth = 1;
    while (true) {
      const token = this.stream.peekNonWhitespace(index);
      if (!token) {
        return false;
      }
      if (token.type === TokenType.LParen) {
        depth += 1;
      } else if (token.type === TokenType.RParen) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          break;
        }
      }
      index += 1;
    }
    return this.stream.peekNonWhitespace(index)?.type === TokenType.LBrace;
  }

  private isArrowFunctionStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== TokenType.LParen) {
      return false;
    }
    let index = 1;
    let depth = 1;
    while (true) {
      const token = this.stream.peekNonWhitespace(index);
      if (!token) {
        return false;
      }
      if (token.type === TokenType.LParen) {
        depth += 1;
      } else if (token.type === TokenType.RParen) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          break;
        }
      }
      index += 1;
    }
    return this.stream.peekNonWhitespace(index)?.type === TokenType.Arrow;
  }

  private isFunctionExpressionAssignmentStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== TokenType.Identifier) {
      return false;
    }
    if (this.stream.peekNonWhitespace(1)?.type !== TokenType.Equals) {
      return false;
    }
    let index = 2;
    if (this.stream.peekNonWhitespace(index)?.type !== TokenType.LParen) {
      return false;
    }
    index += 1;
    let depth = 1;
    while (true) {
      const token = this.stream.peekNonWhitespace(index);
      if (!token) {
        return false;
      }
      if (token.type === TokenType.LParen) {
        depth += 1;
      } else if (token.type === TokenType.RParen) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          break;
        }
      }
      index += 1;
    }
    return this.stream.peekNonWhitespace(index)?.type === TokenType.Arrow;
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

  private parseFunctionDeclaration(): FunctionDeclarationNode {
    const name = this.stream.expect(TokenType.Identifier).value;
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LParen);
    const params: string[] = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated function parameters");
      }
      if (next.type === TokenType.RParen) {
        this.stream.next();
        break;
      }
      const param = this.stream.expect(TokenType.Identifier).value;
      params.push(param);
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.Comma) {
        this.stream.next();
        continue;
      }
      if (this.stream.peek()?.type === TokenType.RParen) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or ')' in function parameters");
    }
    this.stream.skipWhitespace();
    const body = this.parseFunctionBlock();
    return new FunctionDeclarationNode(name, params, body);
  }

  private parseFunctionBlock(): BlockNode {
    this.stream.expect(TokenType.LBrace);
    const statements = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated function block");
      }
      if (next.type === TokenType.RBrace) {
        this.stream.next();
        break;
      }
      statements.push(this.parseStatement({ allowBlocks: false, allowReturn: true }));
    }
    return new BlockNode(statements);
  }

  private parseReturnStatement(): ReturnNode {
    this.stream.expect(TokenType.Return);
    this.stream.skipWhitespace();
    if (this.stream.peek()?.type === TokenType.Semicolon) {
      this.stream.next();
      return new ReturnNode();
    }
    const value = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Semicolon);
    return new ReturnNode(value);
  }

  private parseArrowFunctionExpression(): FunctionExpression {
    this.stream.expect(TokenType.LParen);
    const params: string[] = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated function parameters");
      }
      if (next.type === TokenType.RParen) {
        this.stream.next();
        break;
      }
      const param = this.stream.expect(TokenType.Identifier).value;
      params.push(param);
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.Comma) {
        this.stream.next();
        continue;
      }
      if (this.stream.peek()?.type === TokenType.RParen) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or ')' in function parameters");
    }
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Arrow);
    this.stream.skipWhitespace();
    const body = this.parseFunctionBlock();
    return new FunctionExpression(params, body);
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
