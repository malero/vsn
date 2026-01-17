/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-show", () => {
  it("toggles display without removing element", async () => {
    document.body.innerHTML = `
      <div id="box" vsn-show="visible">Hello</div>
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
