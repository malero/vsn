import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("block scoping", () => {
  it("keeps new variables local to block scopes", async () => {
    const block = Parser.parseInline(`
      if (true) {
        localOnly = 1;
      }
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("localOnly")).toBe(undefined);
  });

  it("updates nearest existing scope from blocks", async () => {
    const block = Parser.parseInline(`
      value = 0;
      if (true) {
        value = 2;
      }
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("value")).toBe(2);
  });

  it("keeps loop locals scoped while allowing loop vars in parent", async () => {
    const block = Parser.parseInline(`
      count = 0;
      for (i = 0; i < 2; i = i + 1) {
        count = count + 1;
        temp = count;
      }
    `);

    const scope = new Scope();
    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("count")).toBe(2);
    expect(scope.get("i")).toBe(2);
    expect(scope.get("temp")).toBe(undefined);
  });
});
