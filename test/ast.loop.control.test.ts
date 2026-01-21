import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("loop control statements", () => {
  it("supports break in while loops", async () => {
    const block = Parser.parseInline(`
      i = 0;
      sum = 0;
      while (true) {
        i += 1;
        sum += i;
        if (i == 3) break;
      }
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("sum")).toBe(6);
  });

  it("supports continue in for loops", async () => {
    const block = Parser.parseInline(`
      sum = 0;
      for (i = 0; i < 5; i += 1) {
        if (i == 2) continue;
        sum += i;
      }
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("sum")).toBe(8);
  });

  it("supports break in for-of loops", async () => {
    const block = Parser.parseInline(`
      items = [1, 2, 3, 4];
      sum = 0;
      for (item of items) {
        if (item == 3) break;
        sum += item;
      }
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("sum")).toBe(3);
  });
});
