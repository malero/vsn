import { describe, expect, it } from "vitest";

import { AssignmentNode, BinaryExpression, Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("hyphenated identifiers", () => {
  it("keeps CSS-style names intact and requires whitespace for subtraction", async () => {
    const block = Parser.parseInline("value = count - 1;");
    const assignment = block.statements[0] as AssignmentNode;

    expect(assignment.value).toBeInstanceOf(BinaryExpression);

    const scope = new Scope();
    scope.set("count", 3);
    await block.evaluate({ scope, rootScope: scope });
    expect(scope.get("value")).toBe(2);

    const hyphenated = Parser.parseInline("value = data-value;");
    const hyphenatedAssignment = hyphenated.statements[0] as AssignmentNode;
    expect((hyphenatedAssignment.value as any).name).toBe("data-value");
  });
});
