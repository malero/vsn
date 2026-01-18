import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("compound assignments", () => {
  it("supports +=, -=, *=, /=", async () => {
    const block = Parser.parseInline(`
      count = 1;
      count += 2;
      count *= 3;
      count -= 4;
      count /= 2;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("count")).toBe(2.5);
  });
});
