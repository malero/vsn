import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("ternary expressions", () => {
  it("evaluates ternary branches based on condition", async () => {
    const block = Parser.parseInline(`
      active = true;
      a = active ? "yes" : "no";
      b = active == false ? "no" : "yes";
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("a")).toBe("yes");
    expect(scope.get("b")).toBe("yes");
  });

  it("parses ternary in bindings", async () => {
    const block = Parser.parseInline(`
      value = 2;
      result = (value > 1) ? "big" : "small";
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("result")).toBe("big");
  });
});
