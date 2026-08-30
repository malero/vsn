import { describe, expect, it } from "vitest";

import { Lexer } from "../src/index";

describe("lexer comments", () => {
  it("rejects an unterminated top-level block comment", () => {
    expect(() => new Lexer("/* unterminated").tokenize())
      .toThrow("Unterminated block comment at 1:1");
  });

  it("rejects an unterminated block comment inside a declaration", () => {
    expect(() => new Lexer("behavior .card { value: 1; /* unterminated").tokenize())
      .toThrow("Unterminated block comment at 1:28");
  });
});
