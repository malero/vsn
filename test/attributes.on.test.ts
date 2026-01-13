/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-on", () => {
  it("creates a scope and runs event handlers", async () => {
    document.body.innerHTML = `
      <button id="btn" vsn-on:click="count = count + 1;"></button>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const button = document.getElementById("btn") as HTMLButtonElement;
    expect(button.getAttributeNames()).toContain("vsn-on:click");
    expect(button.getAttribute("vsn-on:click")).toBe("count = count + 1;");
    const scope = engine.getScope(button);
    scope.set("count", 0);

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(scope.get("count")).toBe(1);
  });
});
