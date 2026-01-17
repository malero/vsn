import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("spread in literals", () => {
  it("expands array spreads", async () => {
    const block = Parser.parseInline(`
      base = [1, 2];
      next = [...base, 3];
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("next")).toEqual([1, 2, 3]);
  });

  it("expands object spreads", async () => {
    const block = Parser.parseInline(`
      base = { a: 1 };
      next = { ...base, b: 2 };
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("next")).toEqual({ a: 1, b: 2 });
  });
});
