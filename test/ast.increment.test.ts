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

  it("supports standalone prefix and postfix updates", async () => {
    const block = Parser.parseInline(`
      i = 0;
      ++i;
      i++;
      --i;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("i")).toBe(1);
  });

  it("keeps JavaScript numeric conversion results, including NaN", async () => {
    const block = Parser.parseInline(`
      value = "not a number";
      old = value++;
      newValue = ++missing;
      empty = null;
      afterEmpty = ++empty;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(Number.isNaN(scope.get("old"))).toBe(true);
    expect(Number.isNaN(scope.get("value"))).toBe(true);
    expect(Number.isNaN(scope.get("newValue"))).toBe(true);
    expect(Number.isNaN(scope.get("missing"))).toBe(true);
    expect(scope.get("afterEmpty")).toBe(1);
    expect(scope.get("empty")).toBe(1);
  });
});
