import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("function parameters", () => {
  it("applies default values", async () => {
    const block = Parser.parseInline(`
      total = 0;
      add = (a = 1, b = 2) => {
        total = a + b;
      };
      add();
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("total")).toBe(3);
  });

  it("captures rest parameters", async () => {
    const block = Parser.parseInline(`
      result = {};
      collect = (...items) => {
        result = { first: items[0], count: items.length };
      };
      collect(5, 6, 7);
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("result")).toEqual({ first: 5, count: 3 });
  });
});
