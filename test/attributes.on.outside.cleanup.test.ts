/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("outside event cleanup", () => {
  it("removes document-level outside handlers when the element is unmounted", async () => {
    document.body.innerHTML = `
      <div id="box" vsn-on:click!outside="clicks += 1;"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const box = document.getElementById("box") as HTMLDivElement;
    const scope = engine.getScope(box);
    scope.set("clicks", 0);

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await tick();
    expect(scope.get("clicks")).toBe(1);

    engine.unmount(box);
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await tick();

    expect(scope.get("clicks")).toBe(1);
  });
});
