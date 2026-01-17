import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("nullish coalescing", () => {
  it("falls back only on nullish values", async () => {
    const block = Parser.parseInline(`
      a = missing ?? "fallback";
      b = null ?? "fallback";
      c = 0 ?? "fallback";
      d = false ?? "fallback";
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("a")).toBe("fallback");
    expect(scope.get("b")).toBe("fallback");
    expect(scope.get("c")).toBe(0);
    expect(scope.get("d")).toBe(false);
  });
});
