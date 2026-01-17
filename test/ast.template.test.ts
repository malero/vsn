import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("template literals", () => {
  it("interpolates expressions", async () => {
    const block = Parser.parseInline(`
      name = "Vision";
      count = 2;
      message = \`Hello \${name}! Count: \${count}.\`;
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("message")).toBe("Hello Vision! Count: 2.");
  });
});
