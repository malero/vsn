/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior parent scopes", () => {
  it("links inline child directives to a behavior-only parent", async () => {
    document.body.innerHTML = `
      <section id="root">
        <button id="child" vsn-on:click="count = count + 1;"></button>
        <span id="output" vsn-bind:from="count"></span>
      </section>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #root {
        count: 0;
      }
    `);
    await engine.mount(document.body);

    const child = document.getElementById("child") as HTMLButtonElement;
    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const root = document.getElementById("root") as HTMLElement;
    expect(engine.getScope(root).get("count")).toBe(1);
    expect(document.getElementById("output")?.textContent).toBe("1");
  });
});
