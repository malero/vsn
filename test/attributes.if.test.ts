/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-if", () => {
  it("toggles display without removing the element, like vsn-show", async () => {
    document.body.innerHTML = `
      <div id="box" vsn-if="visible">Hello</div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const element = document.getElementById("box") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(element.style.display).toBe("none");
    expect(element.isConnected).toBe(true);

    scope.set("visible", true);
    engine.evaluate(element);
    expect(element.style.display).toBe("");
    expect(element.isConnected).toBe(true);
  });
});
