/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-on AST evaluation", () => {
  it("evaluates assignment and binary expressions", async () => {
    document.body.innerHTML = `
      <button id="btn" vsn-on:click="count = count + 1;"></button>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const button = document.getElementById("btn") as HTMLButtonElement;
    const scope = engine.getScope(button);
    scope.set("count", 0);

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("count")).toBe(1);
  });
});
