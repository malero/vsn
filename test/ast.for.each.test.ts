import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("for-in and for-of loops", () => {
  it("supports for-of iteration over arrays", async () => {
    const block = Parser.parseInline(`
      items = [1, 2, 3];
      sum = 0;
      for (item of items) {
        sum += item;
      }
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("sum")).toBe(6);
  });

  it("supports for-in iteration over objects", async () => {
    const block = Parser.parseInline(`
      data = { red: 1, blue: 2 };
      keys = [];
      for (key in data) {
        keys.push(key);
      }
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    const keys = scope.get("keys") as string[];
    expect(keys.length).toBe(2);
    expect(keys.indexOf("red")).not.toBe(-1);
    expect(keys.indexOf("blue")).not.toBe(-1);
  });
});
