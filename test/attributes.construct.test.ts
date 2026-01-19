/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("construct/destruct", () => {
  it("runs construct once on mount and destruct on unmount", async () => {
    document.body.innerHTML = `
      <div id="box" vsn-construct="ready = true;" vsn-destruct="ready = false;"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const element = document.getElementById("box") as HTMLDivElement;
    const scope = engine.getScope(element);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("ready")).toBe(true);

    element.remove();
    engine.unmount(element);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(scope.get("ready")).toBe(false);
  });

  it("sets attributes from directive assignments in construct", async () => {
    document.body.innerHTML = `
      <div id="box" vsn-construct="@data-ready = 'yes';"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const element = document.getElementById("box") as HTMLDivElement;

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(element.getAttribute("data-ready")).toBe("yes");
  });
});
