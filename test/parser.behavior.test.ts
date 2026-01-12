import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";

describe("parser behavior", () => {
  it("parses nested behavior blocks", () => {
    const source = `behavior .card {
  active: false;

  on click() {
    active = !active;
  }

  behavior > .btn-close {
    on click() {
      active = false;
    }
  }
}`;

    const program = new Parser(source).parseProgram();

    expect(program.behaviors).toHaveLength(1);
    expect(program.behaviors[0].selector.selectorText).toBe(".card");
    expect(program.behaviors[0].body.statements.length).toBe(3);

    const nestedBehavior = program.behaviors[0].body.statements[2];
    expect(nestedBehavior.type).toBe("Behavior");
    if (nestedBehavior.type === "Behavior") {
      expect(nestedBehavior.selector.selectorText).toBe("> .btn-close");
    }
  });
});
