import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("control flow blocks", () => {
  it("evaluates if/else and else-if blocks", async () => {
    const block = Parser.parseInline(`
      value = 0;
      if (false) { value = 1; } else if (true) { value = 2; } else { value = 3; }
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("value")).toBe(2);
  });

  it("evaluates while loops", async () => {
    const block = Parser.parseInline(`
      count = 0;
      while (count < 3) { count = count + 1; }
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("count")).toBe(3);
  });

  it("evaluates for loops with init and update", async () => {
    const block = Parser.parseInline(`
      sum = 0;
      for (i = 0; i < 3; i = i + 1) { sum = sum + i; }
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("sum")).toBe(3);
  });
});
