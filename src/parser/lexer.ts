import { Token, TokenType } from "./token";

const KEYWORDS: Record<string, TokenType> = {
  behavior: TokenType.Behavior,
  use: TokenType.Use,
  state: TokenType.State,
  on: TokenType.On,
  construct: TokenType.Construct,
  destruct: TokenType.Destruct,
  return: TokenType.Return,
  if: TokenType.If,
  else: TokenType.Else,
  for: TokenType.For,
  while: TokenType.While,
  try: TokenType.Try,
  catch: TokenType.Catch,
  assert: TokenType.Assert,
  break: TokenType.Break,
  continue: TokenType.Continue,
  true: TokenType.Boolean,
  false: TokenType.Boolean,
  null: TokenType.Null
};

export class Lexer {
  private index = 0;
  private line = 1;
  private column = 1;
  private pendingTokens: Token[] = [];
  private templateMode = false;
  private templateExpressionMode = false;
  private templateBraceDepth = 0;

  constructor(private input: string) {}

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.eof()) {
      if (this.pendingTokens.length > 0) {
        const pending = this.pendingTokens.shift();
        if (pending) {
          tokens.push(pending);
          this.trackTemplateBrace(pending);
          continue;
        }
      }

      if (this.templateMode) {
        const chunk = this.readTemplateChunk();
        tokens.push(chunk);
        continue;
      }

      const ch = this.peek();

      if (this.isWhitespace(ch)) {
        tokens.push(this.readWhitespace());
        continue;
      }

      if (ch === "`") {
        this.next();
        this.templateMode = true;
        continue;
      }

      if (ch === "/" && this.peek(1) === "/") {
        this.readLineComment();
        continue;
      }

      if (ch === "/" && this.peek(1) === "*") {
        this.readBlockComment();
        continue;
      }

      if (this.isAlpha(ch) || ch === "_") {
        tokens.push(this.readIdentifier());
        continue;
      }

    if (this.isDigit(ch) || (ch === "-" && this.isDigit(this.peek(1)))) {
      tokens.push(this.readNumber());
      continue;
    }

    if (ch === "\"" || ch === "'") {
      tokens.push(this.readString());
      continue;
    }

      const punct = this.readPunctuator();
      if (punct) {
        tokens.push(punct);
        this.trackTemplateBrace(punct);
        continue;
      }

      throw new Error(`Unexpected character '${ch}' at ${this.line}:${this.column}`);
    }

    return tokens;
  }

  private readWhitespace(): Token {
    const start = this.position();
    let value = "";
    while (!this.eof() && this.isWhitespace(this.peek())) {
      value += this.next();
    }
    return this.token(TokenType.Whitespace, value, start);
  }

  private readLineComment(): void {
    this.next();
    this.next();
    while (!this.eof() && this.peek() !== "\n") {
      this.next();
    }
  }

  private readBlockComment(): void {
    this.next();
    this.next();
    while (!this.eof()) {
      if (this.peek() === "*" && this.peek(1) === "/") {
        this.next();
        this.next();
        return;
      }
      this.next();
    }
  }

  private readIdentifier(): Token {
    const start = this.position();
    let value = "";
    while (!this.eof()) {
      const ch = this.peek();
      if (this.isAlphaNumeric(ch) || ch === "_") {
        value += this.next();
        continue;
      }
      if (ch === "-") {
        if (this.peek(1) === "-") {
          break;
        }
        value += this.next();
        continue;
      }
      break;
    }

    const keywordType = KEYWORDS[value];
    if (keywordType) {
      return this.token(keywordType, value, start);
    }

    return this.token(TokenType.Identifier, value, start);
  }

  private readNumber(): Token {
    const start = this.position();
    let value = "";
    if (this.peek() === "-") {
      value += this.next();
    }
    while (!this.eof() && this.isDigit(this.peek())) {
      value += this.next();
    }
    if (this.peek() === ".") {
      value += this.next();
      while (!this.eof() && this.isDigit(this.peek())) {
        value += this.next();
      }
    }
    return this.token(TokenType.Number, value, start);
  }

  private readString(): Token {
    const quote = this.next();
    const start = this.position();
    let value = "";
    while (!this.eof()) {
      const ch = this.next();
      if (ch === "\\") {
        const escaped = this.next();
        value += escaped;
        continue;
      }
      if (ch === quote) {
        return this.token(TokenType.String, value, start);
      }
      value += ch;
    }
    throw new Error(`Unterminated string at ${start.line}:${start.column}`);
  }

  private readTemplateChunk(): Token {
    const start = this.position();
    let value = "";
    while (!this.eof()) {
      const ch = this.peek();
      if (ch === "`") {
        this.next();
        this.templateMode = false;
        return this.token(TokenType.Template, value, start);
      }
      if (ch === "$" && this.peek(1) === "{") {
        const dollarStart = this.position();
        this.next();
        const braceStart = this.position();
        this.next();
        this.templateMode = false;
        this.templateExpressionMode = true;
        this.templateBraceDepth = 0;
        this.pendingTokens.push(this.token(TokenType.Dollar, "$", dollarStart));
        this.pendingTokens.push(this.token(TokenType.LBrace, "{", braceStart));
        return this.token(TokenType.Template, value, start);
      }
      if (ch === "\\") {
        this.next();
        const escaped = this.next();
        value += escaped;
        continue;
      }
      value += this.next();
    }
    throw new Error(`Unterminated template literal at ${start.line}:${start.column}`);
  }

  private readPunctuator(): Token | null {
    const start = this.position();
    const ch = this.peek();
    const next = this.peek(1);

    if (ch === "=" && next === "=" && this.peek(2) === "=") {
      this.next();
      this.next();
      this.next();
      return this.token(TokenType.TripleEquals, "===", start);
    }
    if (ch === "=" && next === "=") {
      this.next();
      this.next();
      return this.token(TokenType.DoubleEquals, "==", start);
    }
    if (ch === "=" && next === ">") {
      this.next();
      this.next();
      return this.token(TokenType.Arrow, "=>", start);
    }
    if (ch === "!" && next === "=" && this.peek(2) === "=") {
      this.next();
      this.next();
      this.next();
      return this.token(TokenType.StrictNotEquals, "!==", start);
    }
    if (ch === "!" && next === "=") {
      this.next();
      this.next();
      return this.token(TokenType.NotEquals, "!=", start);
    }
    if (ch === "<" && next === "=") {
      this.next();
      this.next();
      return this.token(TokenType.LessEqual, "<=", start);
    }
    if (ch === ">" && next === "=") {
      this.next();
      this.next();
      return this.token(TokenType.GreaterEqual, ">=", start);
    }
    if (ch === "&" && next === "&") {
      this.next();
      this.next();
      return this.token(TokenType.And, "&&", start);
    }
    if (ch === "|" && next === "|") {
      this.next();
      this.next();
      return this.token(TokenType.Or, "||", start);
    }
    if (ch === "?" && next === "?") {
      this.next();
      this.next();
      return this.token(TokenType.NullishCoalesce, "??", start);
    }
    if (ch === "?" && next === ".") {
      this.next();
      this.next();
      return this.token(TokenType.OptionalChain, "?.", start);
    }
    if (ch === "|" && next === ">") {
      this.next();
      this.next();
      return this.token(TokenType.Pipe, "|>", start);
    }
    if (ch === "+" && next === "+") {
      this.next();
      this.next();
      return this.token(TokenType.PlusPlus, "++", start);
    }
    if (ch === "-" && next === "-") {
      this.next();
      this.next();
      return this.token(TokenType.MinusMinus, "--", start);
    }
    if (ch === "." && next === "." && this.peek(2) === ".") {
      this.next();
      this.next();
      this.next();
      return this.token(TokenType.Ellipsis, "...", start);
    }
    const punctMap: Record<string, TokenType> = {
      "{": TokenType.LBrace,
      "}": TokenType.RBrace,
      "(": TokenType.LParen,
      ")": TokenType.RParen,
      "[": TokenType.LBracket,
      "]": TokenType.RBracket,
      ":": TokenType.Colon,
      ";": TokenType.Semicolon,
      ",": TokenType.Comma,
      ".": TokenType.Dot,
      "#": TokenType.Hash,
      ">": TokenType.Greater,
      "<": TokenType.Less,
      "+": TokenType.Plus,
      "-": TokenType.Minus,
      "~": TokenType.Tilde,
      "*": TokenType.Star,
      "/": TokenType.Slash,
      "%": TokenType.Percent,
      "=": TokenType.Equals,
      "!": TokenType.Bang,
      "@": TokenType.At,
      "$": TokenType.Dollar,
      "?": TokenType.Question
    };

    const type = punctMap[ch];
    if (!type) {
      return null;
    }

    this.next();
    return this.token(type, ch, start);
  }

  private trackTemplateBrace(token: Token): void {
    if (!this.templateExpressionMode) {
      return;
    }
    if (token.type === TokenType.LBrace) {
      this.templateBraceDepth += 1;
    } else if (token.type === TokenType.RBrace) {
      this.templateBraceDepth -= 1;
      if (this.templateBraceDepth <= 0) {
        this.templateExpressionMode = false;
        this.templateMode = true;
      }
    }
  }

  private token(type: TokenType, value: string, start: { index: number; line: number; column: number }): Token {
    return {
      type,
      value,
      start,
      end: this.position()
    };
  }

  private position() {
    return { index: this.index, line: this.line, column: this.column };
  }

  private peek(offset = 0): string {
    return this.input[this.index + offset] ?? "";
  }

  private next(): string {
    const ch = this.input[this.index++] ?? "";
    if (ch === "\n") {
      this.line += 1;
      this.column = 1;
    } else {
      this.column += 1;
    }
    return ch;
  }

  private eof(): boolean {
    return this.index >= this.input.length;
  }

  private isWhitespace(ch: string): boolean {
    return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
  }

  private isAlpha(ch: string): boolean {
    return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
  }

  private isDigit(ch: string): boolean {
    return ch >= "0" && ch <= "9";
  }

  private isAlphaNumeric(ch: string): boolean {
    return this.isAlpha(ch) || this.isDigit(ch);
  }
}
