import { describe, expect, it } from "vitest";

import { BinaryExpression, IdentifierExpression, LiteralExpression, Parser, UnaryExpression } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("ast expressions", () => {
  it("evaluates binary + with identifiers", async () => {
    const scope = new Scope();
    scope.set("count", 1);

    const expr = new BinaryExpression(
      "+",
      new IdentifierExpression("count"),
      new LiteralExpression(2)
    );

    const value = await expr.evaluate({ scope, rootScope: scope });
    expect(value).toBe(3);
  });

  it("evaluates binary - and unary -", async () => {
    const scope = new Scope();
    scope.set("count", 5);

    const expr = new BinaryExpression(
      "-",
      new IdentifierExpression("count"),
      new LiteralExpression(2)
    );

    const neg = new UnaryExpression("-", new LiteralExpression(3));

    const value = await expr.evaluate({ scope, rootScope: scope });
    const negValue = await neg.evaluate({ scope, rootScope: scope });
    expect(value).toBe(3);
    expect(negValue).toBe(-3);
  });

  it("evaluates multiplication, division, and modulo", async () => {
    const scope = new Scope();
    scope.set("count", 6);

    const mul = new BinaryExpression(
      "*",
      new IdentifierExpression("count"),
      new LiteralExpression(2)
    );
    const div = new BinaryExpression(
      "/",
      new IdentifierExpression("count"),
      new LiteralExpression(3)
    );
    const mod = new BinaryExpression(
      "%",
      new IdentifierExpression("count"),
      new LiteralExpression(4)
    );

    const mulValue = await mul.evaluate({ scope, rootScope: scope });
    const divValue = await div.evaluate({ scope, rootScope: scope });
    const modValue = await mod.evaluate({ scope, rootScope: scope });

    expect(mulValue).toBe(12);
    expect(divValue).toBe(2);
    expect(modValue).toBe(2);
  });

  it("evaluates comparisons and boolean ops", async () => {
    const scope = new Scope();
    scope.set("count", 2);

    const lt = new BinaryExpression(
      "<",
      new IdentifierExpression("count"),
      new LiteralExpression(3)
    );
    const eq = new BinaryExpression(
      "==",
      new IdentifierExpression("count"),
      new LiteralExpression(2)
    );
    const andExpr = new BinaryExpression("&&", lt, eq);

    const andValue = await andExpr.evaluate({ scope, rootScope: scope });
    expect(andValue).toBe(true);
  });

  it("evaluates array literals, indexing, and length access", async () => {
    const block = Parser.parseInline(`
      items = [1, 2, 3];
      value = items[1];
      empty = [];
      len = items.length;
      first = [5, 6][0];
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("items")).toEqual([1, 2, 3]);
    expect(scope.get("value")).toBe(2);
    expect(scope.get("empty")).toEqual([]);
    expect(scope.get("len")).toBe(3);
    expect(scope.get("first")).toBe(5);
  });
});
