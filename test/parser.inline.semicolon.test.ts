import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";

describe("parser inline semicolons", () => {
  it("allows single assignment without semicolon in inline blocks", () => {
    expect(() => Parser.parseInline("count = count + 1")).not.toThrow();
  });

  it("allows single call without semicolon in inline blocks", () => {
    expect(() => Parser.parseInline("addTodo()")).not.toThrow();
  });
});
