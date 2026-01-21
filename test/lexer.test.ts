import { describe, expect, it } from "vitest";

import { Lexer, TokenType } from "../src/index";

describe("lexer", () => {
  it("tokenizes keywords and preserves whitespace tokens", () => {
    const lexer = new Lexer("behavior .card { active: false; }");
    const tokens = lexer.tokenize();
    expect(tokens[0]!.type).toBe(TokenType.Behavior);
    expect(tokens.some((token) => token.type === TokenType.Whitespace)).toBe(true);
  });
});
