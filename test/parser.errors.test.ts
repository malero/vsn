import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";

describe("parser error reporting", () => {
  it("includes line and column in syntax errors", () => {
    const source = `
behavior .card {
  active: true
}
`;
    expect(() => new Parser(source).parseProgram()).toThrow(/line\s+\d+.*column\s+\d+/i);
  });

  it("includes a code snippet for context", () => {
    const source = `
behavior .card {
  active: true
}
`;
    try {
      new Parser(source).parseProgram();
    } catch (err) {
      const message = String(err);
      expect(message).toMatch(/Parse error/i);
      expect(message).toMatch(/\n\s*\^/);
    }
  });
});
