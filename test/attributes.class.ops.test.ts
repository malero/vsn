/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("class assignment operators", () => {
  it("supports +=, -=, and ~= on @class", async () => {
    const block = Parser.parseInline(`
      @class = "base";
      @class += "active new";
      @class -= "base";
      @class ~= "toggle";
      @class ~= "toggle";
    `);
    const scope = new Scope();
    const element = document.createElement("div");

    await block.evaluate({ scope, rootScope: scope, element });

    expect(element.className).toBe("active new");
  });
});
