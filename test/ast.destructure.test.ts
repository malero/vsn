import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("destructuring assignments", () => {
  it("assigns array patterns with rest", async () => {
    const block = Parser.parseInline(`
      values = [1, 2, 3];
      [first, second, ...rest] = values;
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("first")).toBe(1);
    expect(scope.get("second")).toBe(2);
    expect(scope.get("rest")).toEqual([3]);
  });

  it("assigns object patterns with renames and rest", async () => {
    const block = Parser.parseInline(`
      data = { a: 1, b: 2, c: 3 };
      { a, b: second, ...rest } = data;
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("a")).toBe(1);
    expect(scope.get("second")).toBe(2);
    expect(scope.get("rest")).toEqual({ c: 3 });
  });
});
