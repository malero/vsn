/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-bind input", () => {
  it("updates scope when input value changes", async () => {
    document.body.innerHTML = `
      <input id="name" value="" vsn-bind:to="name" />
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const input = document.getElementById("name") as HTMLInputElement;
    const scope = engine.getScope(input);

    input.value = "Vision";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(scope.get("name")).toBe("Vision");
  });

  it("preserves whitespace for two-way bindings", async () => {
    document.body.innerHTML = `
      <input id="title" value="" vsn-bind="title" />
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const input = document.getElementById("title") as HTMLInputElement;
    const scope = engine.getScope(input);

    input.value = "  spaced  ";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(scope.get("title")).toBe("  spaced  ");
  });
});
