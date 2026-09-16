/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-show", () => {
  it("toggles semantic hidden state without removing or restyling the element", async () => {
    document.body.innerHTML = `
      <div id="box" style="display: inline-flex" vsn-show="visible">Hello</div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const element = document.getElementById("box") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(element.hidden).toBe(true);
    expect(element.hasAttribute("hidden")).toBe(true);
    expect(element.style.display).toBe("inline-flex");
    expect(element.isConnected).toBe(true);

    scope.set("visible", true);
    engine.evaluate(element);
    expect(element.hidden).toBe(false);
    expect(element.hasAttribute("hidden")).toBe(false);
    expect(element.style.display).toBe("inline-flex");
    expect(element.isConnected).toBe(true);
  });
});
