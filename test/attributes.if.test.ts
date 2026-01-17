/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-if", () => {
  it("toggles element visibility based on scope", async () => {
    document.body.innerHTML = `
      <div id="box" vsn-if="visible">Hello</div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const element = document.getElementById("box") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(element.style.display).toBe("none");

    scope.set("visible", true);
    engine.evaluate(element);
    expect(element.style.display).toBe("");
  });
});
