import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";

describe("parser queries", () => {
  it("parses directives and scoped queries", () => {
    const source = `behavior .card {
  disabled: @disabled;
  color: $background-color;

  on click() {
    active = ?>(.child);
  }
}`;

    const program = new Parser(source).parseProgram();
    const behavior = program.behaviors[0];

    const firstStatement = behavior.body.statements[0];
    expect(firstStatement.type).toBe("Declaration");

    const onBlock = behavior.body.statements[2];
    expect(onBlock.type).toBe("OnBlock");
    if (onBlock.type === "OnBlock") {
      const assignment = onBlock.body.statements[0];
      expect(assignment.type).toBe("Assignment");
    }
  });
});
