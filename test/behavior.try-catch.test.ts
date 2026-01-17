import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("try/catch blocks", () => {
  it("captures thrown errors and restores scope value", async () => {
    const block = Parser.parseInline(`
      errorName = "ok";
      message = "";
      try { boom(); } catch (error) { message = error.name; }
    `);

    const scope = new Scope();
    scope.set("boom", () => {
      throw new TypeError("fail");
    });

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("message")).toBe("TypeError");
    expect(scope.get("error")).toBe(undefined);
    expect(scope.get("errorName")).toBe("ok");
  });
});
