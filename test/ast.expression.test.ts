import { describe, expect, it } from "vitest";

import { BinaryExpression, IdentifierExpression, LiteralExpression, UnaryExpression } from "../src/index";
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

    const value = await expr.evaluate({ scope });
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

    const value = await expr.evaluate({ scope });
    const negValue = await neg.evaluate({ scope });
    expect(value).toBe(3);
    expect(negValue).toBe(-3);
  });
});
