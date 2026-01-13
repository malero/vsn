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

  it("parses assignment targets with paths and directives", () => {
    const source = `behavior .card {
  on click() {
    parent.active = false;
    @aria-pressed = true;
  }
}`;

    const program = new Parser(source).parseProgram();
    const behavior = program.behaviors[0];
    const onBlock = behavior.body.statements[0];

    expect(onBlock.type).toBe("OnBlock");
    if (onBlock.type === "OnBlock") {
      const firstAssignment = onBlock.body.statements[0];
      expect(firstAssignment.type).toBe("Assignment");

      const secondAssignment = onBlock.body.statements[1];
      expect(secondAssignment.type).toBe("Assignment");
    }
  });
});
