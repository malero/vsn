/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("scope chain keywords", () => {
  it("resolves parent and root in assignments", async () => {
    document.body.innerHTML = `
      <div id="root" vsn-bind="count">0
        <div id="middle" vsn-bind="value">x
          <button id="child" vsn-on:click="parent.count = parent.count + 1; root.count = root.count + 1;"></button>
        </div>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const root = document.getElementById("root") as HTMLDivElement;
    const middle = document.getElementById("middle") as HTMLDivElement;
    const child = document.getElementById("child") as HTMLButtonElement;

    const rootScope = engine.getScope(root);
    const middleScope = engine.getScope(middle);
    rootScope.set("count", 0);
    middleScope.set("count", 0);

    let clicked = false;
    child.addEventListener("click", () => {
      clicked = true;
    });

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(clicked).toBe(true);
    expect(middleScope.get("count")).toBe(1);
    expect(rootScope.get("count")).toBe(1);
  });
});
