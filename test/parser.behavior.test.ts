import { describe, expect, it } from "vitest";

import {
  AssignmentNode,
  BehaviorNode,
  IdentifierExpression,
  IndexExpression,
  MemberExpression,
  OnBlockNode,
  Parser
} from "../src/index";

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
    expect(program.behaviors[0]!.selector.selectorText).toBe(".card");
    expect(program.behaviors[0]!.body.statements.length).toBe(3);

    const nestedBehavior = program.behaviors[0]!.body.statements[2] as BehaviorNode;
    expect(nestedBehavior.type).toBe("Behavior");
    expect(nestedBehavior.selector.selectorText).toBe("> .btn-close");
  });

  it("parses assignment targets with paths and directives", () => {
    const source = `behavior .card {
  on click() {
    parent.active = false;
    root.count = (root.count + 1) - 1;
    @aria-pressed = true;
  }
}`;

    const program = new Parser(source).parseProgram();
    const behavior = program.behaviors[0]!;
    const onBlock = behavior.body.statements[0] as OnBlockNode;

    expect(onBlock.type).toBe("OnBlock");
    const firstAssignment = onBlock.body.statements[0] as AssignmentNode;
    expect(firstAssignment.type).toBe("Assignment");
    if (firstAssignment.type === "Assignment") {
      expect(firstAssignment.target.type).toBe("MemberExpression");
      if (firstAssignment.target.type === "MemberExpression") {
        expect(firstAssignment.target.property).toBe("active");
        expect(firstAssignment.target.target.type).toBe("Identifier");
        if (firstAssignment.target.target.type === "Identifier") {
          expect(firstAssignment.target.target.name).toBe("parent");
        }
      }
    }

    const secondAssignment = onBlock.body.statements[1] as AssignmentNode;
    expect(secondAssignment.type).toBe("Assignment");
    if (secondAssignment.type === "Assignment") {
      expect(secondAssignment.target.type).toBe("MemberExpression");
      if (secondAssignment.target.type === "MemberExpression") {
        expect(secondAssignment.target.property).toBe("count");
        expect(secondAssignment.target.target.type).toBe("Identifier");
        if (secondAssignment.target.target.type === "Identifier") {
          expect(secondAssignment.target.target.name).toBe("root");
        }
      }
      expect(secondAssignment.value.type).toBe("BinaryExpression");
    }

    const thirdAssignment = onBlock.body.statements[2] as AssignmentNode;
    expect(thirdAssignment.type).toBe("Assignment");
  });

  it("parses assignment targets with index access followed by property access", () => {
    const source = `behavior .card {
  on click() {
    filters[i].filter = null;
  }
}`;

    const program = new Parser(source).parseProgram();
    const behavior = program.behaviors[0]!;
    const onBlock = behavior.body.statements[0] as OnBlockNode;
    const assignment = onBlock.body.statements[0] as AssignmentNode;

    expect(assignment.type).toBe("Assignment");
    const target = assignment.target as MemberExpression;
    expect(target.type).toBe("MemberExpression");
    expect(target.property).toBe("filter");

    const indexed = target.target as IndexExpression;
    expect(indexed.type).toBe("IndexExpression");

    const base = indexed.target as IdentifierExpression;
    expect(base.type).toBe("Identifier");
    expect(base.name).toBe("filters");

    const index = indexed.index as IdentifierExpression;
    expect(index.type).toBe("Identifier");
    expect(index.name).toBe("i");
  });
});
