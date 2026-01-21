import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("increment and decrement", () => {
  it("supports postfix ++ and --", async () => {
    const block = Parser.parseInline(`
      i = 1;
      a = i++;
      b = i--;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("a")).toBe(1);
    expect(scope.get("b")).toBe(2);
    expect(scope.get("i")).toBe(1);
  });

  it("supports prefix ++ and --", async () => {
    const block = Parser.parseInline(`
      i = 1;
      a = ++i;
      b = --i;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("a")).toBe(2);
    expect(scope.get("b")).toBe(1);
    expect(scope.get("i")).toBe(1);
  });
});
