import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("optional chaining", () => {
  it("returns undefined for missing values", async () => {
    const block = Parser.parseInline(`
      a = missing?.value;
      b = existing?.value;
      c = maybe?.(2);
    `);

    const scope = new Scope();
    scope.set("existing", { value: 3 });
    scope.set("maybe", (value: number) => value + 1);

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("a")).toBe(undefined);
    expect(scope.get("b")).toBe(3);
    expect(scope.get("c")).toBe(3);
  });
});
