import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("object literals", () => {
  it("evaluates object literals with shorthand", async () => {
    const block = Parser.parseInline(`
      name = "Vision";
      data = { name, count: 2, "label": "ok" };
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("data")).toEqual({ name: "Vision", count: 2, label: "ok" });
  });

  it("evaluates computed keys", async () => {
    const block = Parser.parseInline(`
      key = "priority";
      data = { [key]: "high" };
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("data")).toEqual({ priority: "high" });
  });
});
