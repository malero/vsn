import { describe, expect, it, vi } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("call expression", () => {
  it("invokes whitelisted globals like console.log", async () => {
    const block = Parser.parseInline("console.log(count);");
    const scope = new Scope();
    scope.set("count", 3);
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await block.evaluate({ scope, rootScope: scope, globals: { console } });

    expect(spy).toHaveBeenCalledWith(3);
    spy.mockRestore();
  });
});
