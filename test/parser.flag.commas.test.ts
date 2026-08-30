import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";

const parseFlag = (literal: string) => new Parser(`
  behavior .card {
    on click()!foo(${literal}) { }
  }
`, { customFlags: new Set(["foo"]) }).parseProgram();

describe("custom flag collection syntax", () => {
  it("requires separators and rejects trailing commas", () => {
    expect(() => parseFlag("[1, 2]")).not.toThrow();
    expect(() => parseFlag("{ first: 1, second: 2 }")).not.toThrow();

    for (const literal of ["[1 2]", "[1,,2]", "[1,]"]) {
      expect(() => parseFlag(literal), literal).toThrow();
    }
    for (const literal of ["{ first: 1 second: 2 }", "{ first: 1,, second: 2 }", "{ first: 1, }"]) {
      expect(() => parseFlag(literal), literal).toThrow();
    }
  });
});
