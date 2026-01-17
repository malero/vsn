import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("strict equality", () => {
  it("evaluates strict equality and inequality", async () => {
    const block = Parser.parseInline(`
      a = 1 === "1";
      b = 1 !== "1";
      c = 2 === 2;
      d = "2" !== "2";
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("a")).toBe(false);
    expect(scope.get("b")).toBe(true);
    expect(scope.get("c")).toBe(true);
    expect(scope.get("d")).toBe(false);
  });
});
