import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("single-line if statements", () => {
  it("supports single-line if with optional else", async () => {
    const block = Parser.parseInline(`
      count = 0;
      if (true) count = 1;
      if (false) count = 2;
      if (count == 1) count = 3; else count = 4;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("count")).toBe(3);
  });
});
