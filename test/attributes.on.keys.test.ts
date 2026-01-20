/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-on key modifiers", () => {
  it("fires for keyup.enter and supports shift", async () => {
    document.body.innerHTML = `
      <input id="field" vsn-construct="count = 0;" vsn-on:keyup!enter!shift="count = count + 1;" />
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const field = document.getElementById("field") as HTMLInputElement;
    const scope = engine.getScope(field);

    field.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("count")).toBe(0);

    field.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", shiftKey: true, bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("count")).toBe(1);
  });
});
