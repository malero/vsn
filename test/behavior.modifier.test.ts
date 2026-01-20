/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior modifier flags", () => {
  it("invokes modifier hooks when a behavior is bound", async () => {
    document.body.innerHTML = `<div id="card" data-name="Alpha"></div>`;

    const engine = new Engine();
    engine.registerBehaviorModifier("copy", {
      onBind: ({ element, scope, args }) => {
        const attr = typeof args === "string" ? args : "data-name";
        scope.set("copied", element.getAttribute(attr));
      }
    });
    engine.registerBehaviors(`
      behavior #card !copy("data-name") {}
    `);
    await engine.mount(document.body);

    const element = document.getElementById("card") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("copied")).toBe("Alpha");
  });
});
