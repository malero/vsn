/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("element references in expressions", () => {
  it("supports #id.@class assignment", async () => {
    document.body.innerHTML = `<div class="trigger"></div><div id="site-nav"></div>`;
    const hadGlobalEngine = Object.prototype.hasOwnProperty.call(globalThis, "VSNEngine");
    const previousGlobalEngine = (globalThis as any).VSNEngine;
    delete (globalThis as any).VSNEngine;

    try {
      const engine = new Engine();
      engine.registerBehaviors(`
        behavior .trigger {
          construct { #site-nav.@class ~= "is-open"; }
        }
      `);
      await engine.mount(document.body);
    } finally {
      if (hadGlobalEngine) {
        (globalThis as any).VSNEngine = previousGlobalEngine;
      }
    }

    const nav = document.getElementById("site-nav") as HTMLElement;
    expect(nav.classList.contains("is-open")).toBe(true);
  });
});
