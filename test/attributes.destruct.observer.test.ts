/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("destruct observer", () => {
  it("runs destruct when element is removed", async () => {
    document.body.innerHTML = `
      <div id="box" vsn-construct="ready = true;" vsn-destruct="ready = false;"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const element = document.getElementById("box") as HTMLDivElement;
    const scope = engine.getScope(element);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scope.get("ready")).toBe(true);

    element.remove();
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(scope.get("ready")).toBe(false);
  });
});
