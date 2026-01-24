import {
  AssignmentNode,
  ArrayExpression,
  ArrayPattern,
  AssertNode,
  BreakNode,
  CFSNode,
  BehaviorNode,
  BehaviorFlags,
  BehaviorFlagArgs,
  BinaryExpression,
  BlockNode,
  AssignmentTarget,
  CallExpression,
  DeclarationNode,
  DeclarationTarget,
  DeclarationFlags,
  DeclarationFlagArgs,
  MemberExpression,
  DirectiveExpression,
  ElementDirectiveExpression,
  FunctionDeclarationNode,
  FunctionExpression,
  FunctionParam,
  IdentifierExpression,
  ElementRefExpression,
  LiteralExpression,
  ElementPropertyExpression,
  RestElement,
  SpreadElement,
  TemplateExpression,
  TaggedTemplateExpression,
  ForNode,
  ForEachNode,
  IfNode,
  TryNode,
  WhileNode,
  ObjectPattern,
  ObjectExpression,
  ObjectEntry,
  OnBlockNode,
  ProgramNode,
  QueryExpression,
  ReturnNode,
  ContinueNode,
  SelectorNode,
  TernaryExpression,
  UnaryExpression,
  UseNode,
  IndexExpression,
  ExpressionNode,
  AwaitExpression,
  UseFlags,
  UseFlagArgs
} from "../ast/nodes";
import { Lexer } from "./lexer";
import { TokenStream } from "./token-stream";
import { Token, TokenType } from "./token";

export class Parser {
  private stream: TokenStream;
  private source: string;
  private customFlags: Set<string>;
  private behaviorFlags: Set<string>;
  private allowImplicitSemicolon = false;
  private awaitStack: boolean[] = [];
  private functionDepth = 0;

  constructor(input: string, options?: { customFlags?: Set<string>; behaviorFlags?: Set<string> }) {
    this.source = input;
    this.customFlags = options?.customFlags ?? new Set<string>(["important", "debounce"]);
    this.behaviorFlags = options?.behaviorFlags ?? new Set<string>();
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
      this.allowImplicitSemicolon = true;
      return this.parseBlock({ allowDeclarations: false });
    });
  }

  private parseBehavior(): BehaviorNode {
    return this.wrapErrors(() => {
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.Behavior);
      const selector = this.parseSelector();
      const { flags, flagArgs } = this.parseBehaviorFlags();
      const body = this.parseBlock({ allowDeclarations: true });
      return new BehaviorNode(selector, body, flags, flagArgs);
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
      if (token.type === TokenType.Bang) {
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

  private parseBehaviorFlags(): { flags: BehaviorFlags; flagArgs: BehaviorFlagArgs } {
    const result = this.parseFlags(this.behaviorFlags, "behavior modifier");
    return { flags: result.flags, flagArgs: result.flagArgs };
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
      const { flags, flagArgs } = this.parseUseFlags();
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.Semicolon);
      return new UseNode(name, alias, flags, flagArgs);
    });
  }

  private parseUseFlags(): { flags: UseFlags; flagArgs: UseFlagArgs } {
    const flags: UseFlags = {};
    const flagArgs: UseFlagArgs = {};

    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== TokenType.Bang) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect(TokenType.Identifier).value;
      if (name !== "wait") {
        throw new Error(`Unknown flag ${name}`);
      }
      flags.wait = true;
      if (this.stream.peek()?.type === TokenType.LParen) {
        this.stream.next();
        this.stream.skipWhitespace();
        const timeoutToken = this.stream.expect(TokenType.Number);
        const timeoutMs = Number(timeoutToken.value);
        let intervalMs: number | undefined;
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.Comma) {
          this.stream.next();
          this.stream.skipWhitespace();
          const intervalToken = this.stream.expect(TokenType.Number);
          intervalMs = Number(intervalToken.value);
          this.stream.skipWhitespace();
        }
        this.stream.expect(TokenType.RParen);
        flagArgs.wait = { timeoutMs, ...(intervalMs !== undefined ? { intervalMs } : {}) };
      }
    }

    return { flags, flagArgs };
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

  private parseBlock(options?: { allowDeclarations?: boolean; allowReturn?: boolean }): BlockNode {
    const allowDeclarations = options?.allowDeclarations ?? false;
    const allowReturn = options?.allowReturn ?? this.functionDepth > 0;
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LBrace);
    const statements = [];
    let declarationsOpen = allowDeclarations;
    let sawConstruct = false;
    let sawFunctionOrOn = false;
    let sawNestedBehavior = false;

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

      if (allowDeclarations && next.type === TokenType.Behavior) {
        sawNestedBehavior = true;
      }

      if (allowDeclarations && sawNestedBehavior && next.type !== TokenType.Behavior) {
        throw new Error("Nested behaviors must appear after construct, function, and on blocks");
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
        statements.push(this.parseStatement({ allowReturn }));
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

    if (next.type === TokenType.Assert) {
      return this.parseAssertStatement();
    }

    if (next.type === TokenType.Break) {
      return this.parseBreakStatement();
    }

    if (next.type === TokenType.Continue) {
      return this.parseContinueStatement();
    }

    if (allowBlocks && next.type === TokenType.On) {
      return this.parseOnBlock();
    }

    if (allowBlocks && next.type === TokenType.If) {
      return this.parseIfBlock();
    }

    if (allowBlocks && next.type === TokenType.For) {
      return this.parseForBlock();
    }

    if (allowBlocks && next.type === TokenType.While) {
      return this.parseWhileBlock();
    }

    if (allowBlocks && next.type === TokenType.Try) {
      return this.parseTryBlock();
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

    if (this.isAwaitAllowed() && next.type === TokenType.Identifier && next.value === "await") {
      return this.parseExpressionStatement();
    }

    if (this.isAssignmentStart()) {
      return this.parseAssignment();
    }

    if (this.isExpressionStatementStart()) {
      return this.parseExpressionStatement();
    }

    throw new Error(`Unexpected token ${next.type}`);
  }

  private parseOnBlock(): OnBlockNode {
    this.stream.expect(TokenType.On);
    this.stream.skipWhitespace();
    const event = this.parseIdentifierPath();
    const leadingFlags = this.parseOnFlags();
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

    const trailingFlags = this.parseOnFlags();
    const flags = { ...leadingFlags.flags, ...trailingFlags.flags };
    const flagArgs = { ...leadingFlags.flagArgs, ...trailingFlags.flagArgs };
    const body = this.parseBlock({ allowDeclarations: false });
    return new OnBlockNode(event, args, body, flags, flagArgs);
  }

  private parseOnFlags(): { flags: DeclarationFlags; flagArgs: DeclarationFlagArgs } {
    const flags: DeclarationFlags = {};
    const flagArgs: DeclarationFlagArgs = {};

    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== TokenType.Bang) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect(TokenType.Identifier).value;
      if (this.customFlags && !this.customFlags.has(name)) {
        throw new Error(`Unknown flag ${name}`);
      }
      (flags as Record<string, boolean>)[name] = true;

      this.stream.skipWhitespace();
      const next = this.stream.peekNonWhitespace(0);
      if (next?.type !== TokenType.LParen) {
        continue;
      }
      const afterParen = this.stream.peekNonWhitespace(1);
      if (afterParen?.type === TokenType.Identifier || afterParen?.type === TokenType.RParen) {
        continue;
      }
      const customArg = this.parseCustomFlagArg();
      if (customArg !== undefined) {
        (flagArgs as Record<string, any>)[name] = customArg;
      }
    }

    return { flags, flagArgs };
  }

  private parseAssignment(): AssignmentNode {
    const target = this.parseAssignmentTarget();
    this.stream.skipWhitespace();
    const operator = this.parseAssignmentOperator();
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    this.consumeStatementTerminator();
    return new AssignmentNode(target, value, operator);
  }

  private parseExpression(): ExpressionNode {
    return this.parsePipeExpression();
  }

  private parsePipeExpression(): ExpressionNode {
    let expr = this.parseTernaryExpression();
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== TokenType.Pipe) {
        break;
      }
      this.stream.next();
      this.stream.skipWhitespace();
      let awaitStage = false;
      const next = this.stream.peek();
      if (this.isAwaitAllowed() && next?.type === TokenType.Identifier && next.value === "await") {
        this.stream.next();
        this.stream.skipWhitespace();
        awaitStage = true;
      }
      const stage = this.parseCallExpression();
      const call = this.buildPipeCall(expr, stage);
      expr = awaitStage ? new AwaitExpression(call) : call;
    }
    return expr;
  }

  private buildPipeCall(input: ExpressionNode, stage: ExpressionNode): ExpressionNode {
    if (stage instanceof CallExpression) {
      return new CallExpression(stage.callee, [input, ...stage.args]);
    }
    if (stage instanceof IdentifierExpression || stage instanceof MemberExpression) {
      return new CallExpression(stage, [input]);
    }
    throw new Error("Pipe operator requires a function call");
  }

  private parseTernaryExpression(): ExpressionNode {
    let test = this.parseNullishExpression();
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

  private parseNullishExpression(): ExpressionNode {
    let expr = this.parseLogicalOrExpression();
    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== TokenType.NullishCoalesce) {
        break;
      }
      this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseLogicalOrExpression();
      expr = new BinaryExpression("??", expr, right);
    }
    return expr;
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
      if (!next || (next.type !== TokenType.DoubleEquals &&
          next.type !== TokenType.NotEquals &&
          next.type !== TokenType.TripleEquals &&
          next.type !== TokenType.StrictNotEquals)) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseComparisonExpression();
      this.stream.skipWhitespace();
      let operator = "==";
      if (op.type === TokenType.NotEquals) {
        operator = "!=";
      } else if (op.type === TokenType.TripleEquals) {
        operator = "===";
      } else if (op.type === TokenType.StrictNotEquals) {
        operator = "!==";
      }
      left = new BinaryExpression(operator, left, right);
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

  private parseMultiplicativeExpression(): ExpressionNode {
    let left = this.parseUnaryExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next) {
        break;
      }
      if (next.type !== TokenType.Star &&
          next.type !== TokenType.Slash &&
          next.type !== TokenType.Percent) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseUnaryExpression();
      this.stream.skipWhitespace();
      let operator = "*";
      if (op.type === TokenType.Slash) {
        operator = "/";
      } else if (op.type === TokenType.Percent) {
        operator = "%";
      }
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }

  private parseAdditiveExpression(): ExpressionNode {
    let left = this.parseMultiplicativeExpression();
    this.stream.skipWhitespace();
    while (true) {
      const next = this.stream.peekNonWhitespace(0);
      if (!next || (next.type !== TokenType.Plus && next.type !== TokenType.Minus)) {
        break;
      }
      this.stream.skipWhitespace();
      const op = this.stream.next();
      this.stream.skipWhitespace();
      const right = this.parseMultiplicativeExpression();
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
    if (token.type === TokenType.PlusPlus || token.type === TokenType.MinusMinus) {
      this.stream.next();
      const argument = this.parseUnaryExpression();
      return this.createIncrementNode(token, argument, true);
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
    if (this.isAwaitAllowed() && token.type === TokenType.Identifier && token.value === "await") {
      this.stream.next();
      const argument = this.parseUnaryExpression();
      return new AwaitExpression(argument);
    }
    return this.parsePostfixExpression();
  }

  private parsePostfixExpression(): ExpressionNode {
    let expr = this.parseCallExpression();
    while (true) {
      this.stream.skipWhitespace();
      const token = this.stream.peek();
      if (!token) {
        break;
      }
      if (token.type === TokenType.PlusPlus || token.type === TokenType.MinusMinus) {
        this.stream.next();
        expr = this.createIncrementNode(token, expr, false);
        continue;
      }
      break;
    }
    return expr;
  }

  private createIncrementNode(token: Token, argument: ExpressionNode, prefix: boolean): ExpressionNode {
    if (
      !(argument instanceof IdentifierExpression)
      && !(argument instanceof MemberExpression)
      && !(argument instanceof IndexExpression)
      && !(argument instanceof DirectiveExpression)
      && !(argument instanceof ElementDirectiveExpression)
    ) {
      throw new Error("Increment/decrement requires a mutable target");
    }
    const operator = token.type === TokenType.PlusPlus ? "++" : "--";
    return new AssignmentNode(argument, new LiteralExpression(1), operator, prefix) as ExpressionNode;
  }

  private parseCallExpression(): ExpressionNode {
    let expr = this.parsePrimaryExpression();
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        break;
      }
      if (next.type === TokenType.Template) {
        const template = this.parseTemplateExpression();
        if (!(template instanceof TemplateExpression)) {
          throw new Error("Expected template literal");
        }
        expr = new TaggedTemplateExpression(expr, template);
        continue;
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
      if (next.type === TokenType.OptionalChain) {
        this.stream.next();
        this.stream.skipWhitespace();
        const chained = this.stream.peek();
        if (!chained) {
          throw new Error("Expected property or call after ?.");
        }
        if (chained.type === TokenType.LParen) {
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
        if (chained.type === TokenType.Identifier) {
          const name = this.stream.next();
          expr = new MemberExpression(expr, name.value, true);
          continue;
        }
        throw new Error("Expected property or call after ?.");
      }
      if (next.type === TokenType.Dot) {
        this.stream.next();
        const chained = this.stream.peek();
        if (chained?.type === TokenType.At || chained?.type === TokenType.Dollar) {
          const directive = this.parseDirectiveExpression();
          expr = new ElementDirectiveExpression(expr, directive);
        } else {
          const name = this.stream.expect(TokenType.Identifier);
          if (expr instanceof ElementRefExpression) {
            expr = new ElementPropertyExpression(expr, name.value);
          } else {
            expr = new MemberExpression(expr, name.value);
          }
        }
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
      return this.parseDirectiveExpression();
    }

    if (token.type === TokenType.Hash) {
      return this.parseElementRefExpression();
    }

    if (token.type === TokenType.Question) {
      return this.parseQueryExpression();
    }

    if (token.type === TokenType.LBracket) {
      return this.parseArrayExpression();
    }

    if (token.type === TokenType.LBrace) {
      return this.parseObjectExpression();
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
      if (this.isAsyncToken(token) && this.isAsyncArrowFunctionStart()) {
        this.stream.next();
        this.stream.skipWhitespace();
        return this.parseArrowFunctionExpression(true);
      }
      return new IdentifierExpression(this.stream.next().value);
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

    if (token.type === TokenType.Template) {
      return this.parseTemplateExpression();
    }

    throw new Error(`Unsupported expression token ${token.type}`);
  }

  private parseDirectiveExpression(): DirectiveExpression {
    const token = this.stream.peek();
    if (!token || (token.type !== TokenType.At && token.type !== TokenType.Dollar)) {
      throw new Error("Expected directive");
    }
    const kind = token.type === TokenType.At ? "attr" : "style";
    this.stream.next();
    const name = this.stream.expect(TokenType.Identifier);
    return new DirectiveExpression(kind, name.value);
  }

  private parseElementRefExpression(): ElementRefExpression {
    this.stream.expect(TokenType.Hash);
    const id = this.stream.expect(TokenType.Identifier).value;
    return new ElementRefExpression(id);
  }

  private parseArrayExpression(): ExpressionNode {
    this.stream.expect(TokenType.LBracket);
    const elements: (ExpressionNode | SpreadElement)[] = [];
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
      if (next.type === TokenType.Ellipsis) {
        this.stream.next();
        this.stream.skipWhitespace();
        const value = this.parseExpression();
        elements.push(new SpreadElement(value));
      } else {
        elements.push(this.parseExpression());
      }
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

  private parseTemplateExpression(): ExpressionNode {
    const parts: ExpressionNode[] = [];
    while (true) {
      const token = this.stream.peek();
      if (!token) {
        throw new Error("Unterminated template literal");
      }
      if (token.type !== TokenType.Template) {
        throw new Error("Expected template literal");
      }
      const literal = this.stream.next().value;
      parts.push(new LiteralExpression(literal));
      const next = this.stream.peek();
      if (!next || next.type !== TokenType.Dollar) {
        break;
      }
      this.stream.next();
      this.stream.expect(TokenType.LBrace);
      this.stream.skipWhitespace();
      const expr = this.parseExpression();
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.RBrace);
      parts.push(expr);
    }
    return new TemplateExpression(parts);
  }

  private parseObjectExpression(): ExpressionNode {
    this.stream.expect(TokenType.LBrace);
    const entries: ObjectEntry[] = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated object literal");
      }
      if (next.type === TokenType.RBrace) {
        this.stream.next();
        break;
      }

      let value: ExpressionNode | undefined;
      let entry: ObjectEntry | undefined;
      if (next.type === TokenType.Ellipsis) {
        this.stream.next();
        this.stream.skipWhitespace();
        entry = { spread: this.parseExpression() };
      } else if (next.type === TokenType.LBracket) {
        this.stream.next();
        this.stream.skipWhitespace();
        const keyExpr = this.parseExpression();
        this.stream.skipWhitespace();
        this.stream.expect(TokenType.RBracket);
        this.stream.skipWhitespace();
        this.stream.expect(TokenType.Colon);
        this.stream.skipWhitespace();
        value = this.parseExpression();
        entry = { keyExpr, value, computed: true };
      } else if (next.type === TokenType.Identifier) {
        const name = this.stream.next().value;
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.Colon) {
          this.stream.next();
          this.stream.skipWhitespace();
          value = this.parseExpression();
        } else {
          value = new IdentifierExpression(name);
        }
        entry = { key: name, value };
      } else if (next.type === TokenType.String) {
        const key = this.stream.next().value;
        this.stream.skipWhitespace();
        this.stream.expect(TokenType.Colon);
        this.stream.skipWhitespace();
        value = this.parseExpression();
        entry = { key, value };
      } else {
        throw new Error(`Unexpected token in object literal: ${next.type}`);
      }

      if (!entry) {
        throw new Error("Invalid object literal entry");
      }
      entries.push(entry);

      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.Comma) {
        this.stream.next();
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.RBrace) {
          this.stream.next();
          break;
        }
        continue;
      }
      if (this.stream.peek()?.type === TokenType.RBrace) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or '}' in object literal");
    }
    return new ObjectExpression(entries);
  }

  private consumeStatementTerminator(): void {
    this.stream.skipWhitespace();
    const next = this.stream.peek();
    if (next?.type === TokenType.Semicolon) {
      this.stream.next();
      return;
    }
    if (this.allowImplicitSemicolon && next?.type === TokenType.RBrace) {
      return;
    }
    this.stream.expect(TokenType.Semicolon);
  }

  private parseFunctionBlockWithAwait(allowAwait: boolean): BlockNode {
    this.stream.expect(TokenType.LBrace);
    const statements = [];
    this.awaitStack.push(allowAwait);
    this.functionDepth += 1;
    try {
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
        statements.push(this.parseStatement({ allowBlocks: true, allowReturn: true }));
      }
    } finally {
      this.functionDepth -= 1;
      this.awaitStack.pop();
    }
    return new BlockNode(statements);
  }

  private isAsyncToken(token?: Token | null): boolean {
    return token?.type === TokenType.Identifier && token.value === "async";
  }

  private isAwaitAllowed(): boolean {
    if (this.awaitStack.length === 0) {
      return false;
    }
    return this.awaitStack[this.awaitStack.length - 1] === true;
  }

  private parseArrowExpressionBody(allowAwait: boolean): BlockNode {
    this.awaitStack.push(allowAwait);
    try {
      const expression = this.parseExpression();
      return new BlockNode([new ReturnNode(expression)]);
    } finally {
      this.awaitStack.pop();
    }
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

    if (token.type === TokenType.LBracket) {
      return this.parseArrayPattern();
    }

    if (token.type === TokenType.LBrace) {
      return this.parseObjectPattern();
    }

    if (token.type === TokenType.Identifier) {
      const expr = this.parseCallExpression();
      if (expr instanceof CallExpression) {
        throw new Error("Invalid assignment target CallExpression");
      }
      if (
        expr instanceof IdentifierExpression
        || expr instanceof MemberExpression
        || expr instanceof IndexExpression
        || expr instanceof ElementDirectiveExpression
      ) {
        return expr;
      }
      throw new Error("Invalid assignment target");
    }

    if (token.type === TokenType.Hash) {
      const expr = this.parseCallExpression();
      if (expr instanceof ElementDirectiveExpression) {
        return expr;
      }
      throw new Error("Invalid assignment target");
    }

    throw new Error(`Invalid assignment target ${token.type}`);
  }

  private parseArrayPattern(): ArrayPattern {
    this.stream.expect(TokenType.LBracket);
    const elements: (IdentifierExpression | ArrayPattern | ObjectPattern | RestElement | null)[] = [];
    let sawRest = false;
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated array pattern");
      }
      if (next.type === TokenType.RBracket) {
        this.stream.next();
        break;
      }
      if (next.type === TokenType.Comma) {
        this.stream.next();
        elements.push(null);
        continue;
      }
      if (next.type === TokenType.Ellipsis) {
        if (sawRest) {
          throw new Error("Array patterns can only include one rest element");
        }
        this.stream.next();
        this.stream.skipWhitespace();
        const name = this.stream.expect(TokenType.Identifier);
        elements.push(new RestElement(new IdentifierExpression(name.value)));
        sawRest = true;
      } else if (next.type === TokenType.LBracket) {
        elements.push(this.parseArrayPattern());
      } else if (next.type === TokenType.LBrace) {
        elements.push(this.parseObjectPattern());
      } else if (next.type === TokenType.Identifier) {
        elements.push(new IdentifierExpression(this.parseIdentifierPath()));
      } else {
        throw new Error(`Unexpected token in array pattern: ${next.type}`);
      }
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.Comma) {
        this.stream.next();
        continue;
      }
      if (this.stream.peek()?.type === TokenType.RBracket) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or ']' in array pattern");
    }
    if (sawRest) {
      const last = elements[elements.length - 1];
      if (!(last instanceof RestElement)) {
        throw new Error("Rest element must be last in array pattern");
      }
    }
    return new ArrayPattern(elements);
  }

  private parseObjectPattern(): ObjectPattern {
    this.stream.expect(TokenType.LBrace);
    const entries: { key: string; target: IdentifierExpression | ArrayPattern | ObjectPattern }[] = [];
    let rest: IdentifierExpression | undefined;
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated object pattern");
      }
      if (next.type === TokenType.RBrace) {
        this.stream.next();
        break;
      }
      if (next.type === TokenType.Ellipsis) {
        if (rest) {
          throw new Error("Object patterns can only include one rest element");
        }
        this.stream.next();
        this.stream.skipWhitespace();
        const name = this.stream.expect(TokenType.Identifier);
        rest = new IdentifierExpression(name.value);
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.Comma) {
          this.stream.next();
          this.stream.skipWhitespace();
        }
        if (this.stream.peek()?.type !== TokenType.RBrace) {
          throw new Error("Rest element must be last in object pattern");
        }
        this.stream.next();
        break;
      } else if (next.type === TokenType.Identifier || next.type === TokenType.String) {
        const keyToken = this.stream.next();
        const key = keyToken.value;
        this.stream.skipWhitespace();
        let target: IdentifierExpression | ArrayPattern | ObjectPattern;
        if (this.stream.peek()?.type === TokenType.Colon) {
          this.stream.next();
          this.stream.skipWhitespace();
          const valueToken = this.stream.peek();
          if (!valueToken) {
            throw new Error("Expected object pattern target");
          }
          if (valueToken.type === TokenType.LBracket) {
            target = this.parseArrayPattern();
          } else if (valueToken.type === TokenType.LBrace) {
            target = this.parseObjectPattern();
          } else if (valueToken.type === TokenType.Identifier) {
            target = new IdentifierExpression(this.parseIdentifierPath());
          } else {
            throw new Error(`Unexpected token in object pattern: ${valueToken.type}`);
          }
        } else {
          target = new IdentifierExpression(key);
        }
        entries.push({ key, target });
      } else {
        throw new Error(`Unexpected token in object pattern: ${next.type}`);
      }

      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.Comma) {
        this.stream.next();
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.RBrace) {
          this.stream.next();
          break;
        }
        continue;
      }
      if (this.stream.peek()?.type === TokenType.RBrace) {
        this.stream.next();
        break;
      }
      throw new Error("Expected ',' or '}' in object pattern");
    }
    const patternEntries = rest ? [...entries, { rest }] : entries;
    if (rest && entries.length === 0) {
      return new ObjectPattern([{ rest }]);
    }
    return new ObjectPattern(patternEntries);
  }

  private parseDeclaration(): DeclarationNode {
    const target = this.parseDeclarationTarget();
    this.stream.skipWhitespace();
    const operator = this.parseDeclarationOperator();
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    const { flags, flagArgs } = this.parseFlags(this.customFlags, "flag");
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

  private parseFlags(
    allowed: Set<string> | null,
    errorLabel: string
  ): { flags: DeclarationFlags; flagArgs: DeclarationFlagArgs } {
    const flags: DeclarationFlags = {};
    const flagArgs: DeclarationFlagArgs = {};

    while (true) {
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type !== TokenType.Bang) {
        break;
      }
      this.stream.next();
      const name = this.stream.expect(TokenType.Identifier).value;
      if (allowed && !allowed.has(name)) {
        throw new Error(`Unknown ${errorLabel} ${name}`);
      }
      (flags as Record<string, boolean>)[name] = true;
      const customArg = this.parseCustomFlagArg();
      if (customArg !== undefined) {
        (flagArgs as Record<string, any>)[name] = customArg;
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
    const value = this.parseCustomFlagLiteral();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.RParen);
    return value;
  }

  private parseCustomFlagLiteral(): any {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Unterminated flag arguments");
    }
    if (token.type === TokenType.Number) {
      return Number(this.stream.next().value);
    }
    if (token.type === TokenType.String) {
      return this.stream.next().value;
    }
    if (token.type === TokenType.Boolean) {
      return this.stream.next().value === "true";
    }
    if (token.type === TokenType.Identifier) {
      return this.stream.next().value;
    }
    if (token.type === TokenType.LBracket) {
      return this.parseCustomFlagArray();
    }
    if (token.type === TokenType.LBrace) {
      return this.parseCustomFlagObject();
    }
    throw new Error(`Unsupported flag argument ${token.type}`);
  }

  private parseCustomFlagArray(): any[] {
    this.stream.expect(TokenType.LBracket);
    const items: any[] = [];
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated flag array");
      }
      if (next.type === TokenType.RBracket) {
        this.stream.next();
        break;
      }
      items.push(this.parseCustomFlagLiteral());
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.Comma) {
        this.stream.next();
      }
    }
    return items;
  }

  private parseCustomFlagObject(): Record<string, any> {
    this.stream.expect(TokenType.LBrace);
    const obj: Record<string, any> = {};
    while (true) {
      this.stream.skipWhitespace();
      const next = this.stream.peek();
      if (!next) {
        throw new Error("Unterminated flag object");
      }
      if (next.type === TokenType.RBrace) {
        this.stream.next();
        break;
      }
      let key: string;
      if (next.type === TokenType.Identifier || next.type === TokenType.String) {
        key = this.stream.next().value;
      } else {
        throw new Error(`Unsupported flag object key ${next.type}`);
      }
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.Colon);
      this.stream.skipWhitespace();
      obj[key] = this.parseCustomFlagLiteral();
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.Comma) {
        this.stream.next();
      }
    }
    return obj;
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
      while (true) {
        const token = this.stream.peekNonWhitespace(index);
        if (!token) {
          return false;
        }
        if (token.type === TokenType.Dot) {
          const next = this.stream.peekNonWhitespace(index + 1);
          if (next?.type === TokenType.Identifier) {
            index += 2;
            continue;
          }
          if (next?.type === TokenType.At || next?.type === TokenType.Dollar) {
            const afterDirective = this.stream.peekNonWhitespace(index + 2);
            if (afterDirective?.type !== TokenType.Identifier) {
              return false;
            }
            index += 3;
            continue;
          }
          return false;
        }
        if (token.type === TokenType.LBracket) {
          const indexAfter = this.stream.indexAfterDelimited(TokenType.LBracket, TokenType.RBracket, index);
          if (indexAfter === null) {
            return false;
          }
          index = indexAfter;
          continue;
        }
        break;
      }
      return this.isAssignmentOperatorStart(index);
    }

    if (first.type === TokenType.At || first.type === TokenType.Dollar) {
      const second = this.stream.peekNonWhitespace(1);
      return second?.type === TokenType.Identifier && this.isAssignmentOperatorStart(2);
    }

    if (first.type === TokenType.Hash) {
      let index = 1;
      if (this.stream.peekNonWhitespace(index)?.type !== TokenType.Identifier) {
        return false;
      }
      index += 1;
      while (true) {
        const token = this.stream.peekNonWhitespace(index);
        if (!token) {
          return false;
        }
        if (token.type === TokenType.Dot) {
          const next = this.stream.peekNonWhitespace(index + 1);
          if (next?.type === TokenType.Identifier) {
            index += 2;
            continue;
          }
          if (next?.type === TokenType.At || next?.type === TokenType.Dollar) {
            const afterDirective = this.stream.peekNonWhitespace(index + 2);
            if (afterDirective?.type !== TokenType.Identifier) {
              return false;
            }
            index += 3;
            continue;
          }
          return false;
        }
        if (token.type === TokenType.LBracket) {
          const indexAfter = this.stream.indexAfterDelimited(TokenType.LBracket, TokenType.RBracket, index);
          if (indexAfter === null) {
            return false;
          }
          index = indexAfter;
          continue;
        }
        break;
      }
      return this.isAssignmentOperatorStart(index);
    }

    if (first.type === TokenType.LBrace || first.type === TokenType.LBracket) {
      const stack: TokenType[] = [];
      let index = 0;
      while (true) {
        const token = this.stream.peekNonWhitespace(index);
        if (!token) {
          return false;
        }
        if (token.type === TokenType.LBrace || token.type === TokenType.LBracket) {
          stack.push(token.type);
        } else if (token.type === TokenType.RBrace || token.type === TokenType.RBracket) {
          stack.pop();
          if (stack.length === 0) {
            return this.isAssignmentOperatorStart(index + 1);
          }
        }
        index += 1;
      }
    }

    return false;
  }

  private isAssignmentOperatorStart(index: number): boolean {
    const token = this.stream.peekNonWhitespace(index);
    if (!token) {
      return false;
    }
    if (token.type === TokenType.Equals) {
      return true;
    }
    if (token.type === TokenType.Tilde) {
      const next = this.stream.peekNonWhitespace(index + 1);
      return next?.type === TokenType.Equals;
    }
    if (token.type === TokenType.Plus ||
        token.type === TokenType.Minus ||
        token.type === TokenType.Star ||
        token.type === TokenType.Slash) {
      const next = this.stream.peekNonWhitespace(index + 1);
      return next?.type === TokenType.Equals;
    }
    return false;
  }

  private isExpressionStatementStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first) {
      return false;
    }
    if (first.type === TokenType.Identifier) {
      return true;
    }
    return (
      first.type === TokenType.Number
      || first.type === TokenType.String
      || first.type === TokenType.Boolean
      || first.type === TokenType.Null
      || first.type === TokenType.LParen
      || first.type === TokenType.LBracket
      || first.type === TokenType.LBrace
      || first.type === TokenType.At
      || first.type === TokenType.Dollar
      || first.type === TokenType.Hash
      || first.type === TokenType.Question
      || first.type === TokenType.Bang
      || first.type === TokenType.Minus
    );
  }

  private isFunctionDeclarationStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first) {
      return false;
    }
    let index = 0;
    if (this.isAsyncToken(first)) {
      const next = this.stream.peekNonWhitespace(1);
      if (!next || next.type !== TokenType.Identifier) {
        return false;
      }
      index = 1;
    } else if (first.type !== TokenType.Identifier) {
      return false;
    }
    index += 1;
    if (this.stream.peekNonWhitespace(index)?.type !== TokenType.LParen) {
      return false;
    }
    const indexAfterParams = this.stream.indexAfterDelimited(TokenType.LParen, TokenType.RParen, index);
    if (indexAfterParams === null) {
      return false;
    }
    return this.stream.peekNonWhitespace(indexAfterParams)?.type === TokenType.LBrace;
  }

  private isArrowFunctionStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!first || first.type !== TokenType.LParen) {
      return false;
    }
    const indexAfterParams = this.stream.indexAfterDelimited(TokenType.LParen, TokenType.RParen, 0);
    if (indexAfterParams === null) {
      return false;
    }
    return this.stream.peekNonWhitespace(indexAfterParams)?.type === TokenType.Arrow;
  }

  private isAsyncArrowFunctionStart(): boolean {
    const first = this.stream.peekNonWhitespace(0);
    if (!this.isAsyncToken(first)) {
      return false;
    }
    if (this.stream.peekNonWhitespace(1)?.type !== TokenType.LParen) {
      return false;
    }
    const indexAfterParams = this.stream.indexAfterDelimited(TokenType.LParen, TokenType.RParen, 1);
    if (indexAfterParams === null) {
      return false;
    }
    return this.stream.peekNonWhitespace(indexAfterParams)?.type === TokenType.Arrow;
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
    if (this.isAsyncToken(this.stream.peekNonWhitespace(index))) {
      index += 1;
    }
    if (this.stream.peekNonWhitespace(index)?.type !== TokenType.LParen) {
      return false;
    }
    const indexAfterParams = this.stream.indexAfterDelimited(TokenType.LParen, TokenType.RParen, index);
    if (indexAfterParams === null) {
      return false;
    }
    return this.stream.peekNonWhitespace(indexAfterParams)?.type === TokenType.Arrow;
  }

  private parseExpressionStatement(): ExpressionNode {
    const expr = this.parseExpression();
    this.consumeStatementTerminator();
    return expr;
  }

  private parseIfBlock(): IfNode {
    this.stream.expect(TokenType.If);
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LParen);
    this.stream.skipWhitespace();
    const test = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.RParen);
    const consequent = this.parseConditionalBody();
    this.stream.skipWhitespace();
    let alternate: BlockNode | undefined;
    if (this.stream.peek()?.type === TokenType.Else) {
      this.stream.next();
      this.stream.skipWhitespace();
      if (this.stream.peek()?.type === TokenType.If) {
        const nested = this.parseIfBlock();
        alternate = new BlockNode([nested]);
      } else {
        alternate = this.parseConditionalBody();
      }
    }
    return new IfNode(test, consequent, alternate);
  }

  private parseConditionalBody(): BlockNode {
    this.stream.skipWhitespace();
    if (this.stream.peek()?.type === TokenType.LBrace) {
      return this.parseBlock({ allowDeclarations: false });
    }
    const statement = this.parseStatement({ allowBlocks: false, allowReturn: this.functionDepth > 0 });
    return new BlockNode([statement]);
  }

  private parseWhileBlock(): WhileNode {
    this.stream.expect(TokenType.While);
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LParen);
    this.stream.skipWhitespace();
    const test = this.parseExpression();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.RParen);
    const body = this.parseBlock({ allowDeclarations: false });
    return new WhileNode(test, body);
  }

  private parseForBlock(): ForNode | ForEachNode {
    this.stream.expect(TokenType.For);
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LParen);
    this.stream.skipWhitespace();
    const eachKind = this.detectForEachKind();
    if (eachKind) {
      const target = this.parseForEachTarget();
      this.stream.skipWhitespace();
      const keyword = this.stream.expect(TokenType.Identifier);
      if (keyword.value !== eachKind) {
        throw new Error(`Expected '${eachKind}' but got '${keyword.value}'`);
      }
      this.stream.skipWhitespace();
      const iterable = this.parseExpression();
      this.stream.skipWhitespace();
      this.stream.expect(TokenType.RParen);
      const body = this.parseBlock({ allowDeclarations: false });
      return new ForEachNode(target, iterable, eachKind, body);
    }
    let init: CFSNode | undefined;
    if (this.stream.peek()?.type !== TokenType.Semicolon) {
      init = this.parseForClause();
    }
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Semicolon);
    this.stream.skipWhitespace();
    let test: ExpressionNode | undefined;
    if (this.stream.peek()?.type !== TokenType.Semicolon) {
      test = this.parseExpression();
    }
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Semicolon);
    this.stream.skipWhitespace();
    let update: CFSNode | undefined;
    if (this.stream.peek()?.type !== TokenType.RParen) {
      update = this.parseForClause();
    }
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.RParen);
    const body = this.parseBlock({ allowDeclarations: false });
    return new ForNode(init, test, update, body);
  }

  private detectForEachKind(): "in" | "of" | null {
    let offset = 0;
    let depth = 0;
    while (true) {
      const token = this.stream.peekNonWhitespace(offset);
      if (!token) {
        return null;
      }
      if (token.type === TokenType.LParen || token.type === TokenType.LBracket || token.type === TokenType.LBrace) {
        depth += 1;
      } else if (
        token.type === TokenType.RParen
        || token.type === TokenType.RBracket
        || token.type === TokenType.RBrace
      ) {
        if (depth === 0) {
          return null;
        }
        depth -= 1;
      }
      if (depth === 0) {
        if (token.type === TokenType.Semicolon) {
          return null;
        }
        if (
          token.type === TokenType.Identifier
          && (token.value === "in" || token.value === "of")
        ) {
          return token.value;
        }
      }
      offset += 1;
    }
  }

  private parseForEachTarget(): IdentifierExpression {
    const token = this.stream.peek();
    if (!token) {
      throw new Error("Expected for-each target");
    }
    if (token.type !== TokenType.Identifier) {
      throw new Error("for-in/of target must be an identifier");
    }
    return new IdentifierExpression(this.stream.next().value);
  }

  private parseForClause(): CFSNode {
    if (this.isAssignmentStart()) {
      return this.parseAssignmentExpression();
    }
    return this.parseExpression();
  }

  private parseAssignmentExpression(): AssignmentNode {
    const target = this.parseAssignmentTarget();
    this.stream.skipWhitespace();
    const operator = this.parseAssignmentOperator();
    this.stream.skipWhitespace();
    const value = this.parseExpression();
    return new AssignmentNode(target, value, operator);
  }

  private parseAssignmentOperator(): "=" | "+=" | "-=" | "*=" | "/=" | "~=" {
    const next = this.stream.peek();
    if (!next) {
      throw new Error("Expected assignment operator");
    }
    if (next.type === TokenType.Equals) {
      this.stream.next();
      return "=";
    }
    if (next.type === TokenType.Tilde) {
      this.stream.next();
      this.stream.expect(TokenType.Equals);
      return "~=";
    }
    if (next.type === TokenType.Plus ||
        next.type === TokenType.Minus ||
        next.type === TokenType.Star ||
        next.type === TokenType.Slash) {
      const op = this.stream.next();
      this.stream.expect(TokenType.Equals);
      if (op.type === TokenType.Plus) {
        return "+=";
      }
      if (op.type === TokenType.Minus) {
        return "-=";
      }
      if (op.type === TokenType.Star) {
        return "*=";
      }
      return "/=";
    }
    throw new Error("Expected assignment operator");
  }

  private parseTryBlock(): TryNode {
    this.stream.expect(TokenType.Try);
    const body = this.parseBlock({ allowDeclarations: false });
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Catch);
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.LParen);
    this.stream.skipWhitespace();
    const errorName = this.stream.expect(TokenType.Identifier).value;
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.RParen);
    const handler = this.parseBlock({ allowDeclarations: false });
    return new TryNode(body, errorName, handler);
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
    let isAsync = false;
    const first = this.stream.peekNonWhitespace(0);
    if (this.isAsyncToken(first)) {
      this.stream.next();
      this.stream.skipWhitespace();
      isAsync = true;
    }
    const name = this.stream.expect(TokenType.Identifier).value;
    this.stream.skipWhitespace();
    const params = this.parseFunctionParams();
    this.stream.skipWhitespace();
    const body = this.parseFunctionBlockWithAwait(isAsync);
    return new FunctionDeclarationNode(name, params, body, isAsync);
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

  private parseAssertStatement(): AssertNode {
    this.stream.expect(TokenType.Assert);
    this.stream.skipWhitespace();
    const test = this.parseExpression();
    this.consumeStatementTerminator();
    return new AssertNode(test);
  }

  private parseBreakStatement(): BreakNode {
    this.stream.expect(TokenType.Break);
    this.consumeStatementTerminator();
    return new BreakNode();
  }

  private parseContinueStatement(): ContinueNode {
    this.stream.expect(TokenType.Continue);
    this.consumeStatementTerminator();
    return new ContinueNode();
  }

  private parseArrowFunctionExpression(isAsync = false): FunctionExpression {
    const params = this.parseFunctionParams();
    this.stream.skipWhitespace();
    this.stream.expect(TokenType.Arrow);
    this.stream.skipWhitespace();
    if (this.stream.peek()?.type === TokenType.LBrace) {
      const body = this.parseFunctionBlockWithAwait(isAsync);
      return new FunctionExpression(params, body, isAsync);
    }
    const body = this.parseArrowExpressionBody(isAsync);
    return new FunctionExpression(params, body, isAsync);
  }

  private parseFunctionParams(): FunctionParam[] {
    this.stream.expect(TokenType.LParen);
    const params: FunctionParam[] = [];
    let sawRest = false;
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
      if (next.type === TokenType.Ellipsis) {
        if (sawRest) {
          throw new Error("Function parameters can only include one rest parameter");
        }
        this.stream.next();
        this.stream.skipWhitespace();
        const name = this.stream.expect(TokenType.Identifier).value;
        params.push({ name, rest: true });
        sawRest = true;
        this.stream.skipWhitespace();
        if (this.stream.peek()?.type === TokenType.Comma) {
          throw new Error("Rest parameter must be last in function parameters");
        }
        this.stream.expect(TokenType.RParen);
        break;
      }
      const name = this.stream.expect(TokenType.Identifier).value;
      this.stream.skipWhitespace();
      let defaultValue: ExpressionNode | undefined;
      if (this.stream.peek()?.type === TokenType.Equals) {
        this.stream.next();
        this.stream.skipWhitespace();
        defaultValue = this.parseExpression();
      }
      params.push(defaultValue ? { name, defaultValue } : { name });
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
    return params;
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
