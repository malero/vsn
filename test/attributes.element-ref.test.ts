/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("element references in expressions", () => {
  it("supports #id.@class assignment", async () => {
    document.body.innerHTML = `<div id="site-nav"></div>`;
    const block = Parser.parseInline(`
      #site-nav.@class ~= "is-open";
    `);
    const scope = new Scope();

    const engine = { getScope: () => scope };
    (globalThis as any).VSNEngine = engine;
    await block.evaluate({ scope, rootScope: scope, element: document.body });
    (globalThis as any).VSNEngine = undefined;

    const nav = document.getElementById("site-nav") as HTMLElement;
    expect(nav.classList.contains("is-open")).toBe(true);
  });
});
