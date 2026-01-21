import { Token, TokenType } from "./token";

export class TokenStream {
  private index = 0;

  constructor(private tokens: Token[]) {}

  peek(offset = 0): Token | null {
    return this.tokens[this.index + offset] ?? null;
  }

  next(): Token {
    const token = this.tokens[this.index++];
    if (!token) {
      throw new Error("Unexpected end of input");
    }
    return token;
  }

  eof(): boolean {
    return this.index >= this.tokens.length;
  }

  match(type: TokenType): boolean {
    if (this.peek()?.type === type) {
      this.next();
      return true;
    }
    return false;
  }

  expect(type: TokenType): Token {
    const token = this.next();
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type}`);
    }
    return token;
  }

  skipWhitespace(): void {
    while (this.peek()?.type === TokenType.Whitespace) {
      this.next();
    }
  }

  peekNonWhitespace(offset = 0): Token | null {
    let count = 0;
    for (let i = this.index; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (!token) {
        continue;
      }
      if (token.type === TokenType.Whitespace) {
        continue;
      }
      if (count === offset) {
        return token;
      }
      count += 1;
    }
    return null;
  }

  indexAfterDelimited(openType: TokenType, closeType: TokenType, offset = 0): number | null {
    const first = this.peekNonWhitespace(offset);
    if (!first || first.type !== openType) {
      return null;
    }
    let index = offset + 1;
    let depth = 1;
    while (true) {
      const token = this.peekNonWhitespace(index);
      if (!token) {
        return null;
      }
      if (token.type === openType) {
        depth += 1;
      } else if (token.type === closeType) {
        depth -= 1;
        if (depth === 0) {
          return index + 1;
        }
      }
      index += 1;
    }
  }
}
