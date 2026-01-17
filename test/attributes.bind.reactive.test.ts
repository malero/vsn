/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("reactive bindings", () => {
  it("updates element when scope changes", async () => {
    document.body.innerHTML = `
      <span id="name" vsn-bind="name"></span>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const span = document.getElementById("name") as HTMLSpanElement;
    const scope = engine.getScope(span);

    scope.set("name", "Vision");

    expect(span.textContent).toBe("Vision");
  });

  it("updates child bindings when parent scope changes", async () => {
    document.body.innerHTML = `
      <div id="parent" vsn-bind="count">0
        <span id="child" vsn-bind:from="count"></span>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const parent = document.getElementById("parent") as HTMLDivElement;
    const child = document.getElementById("child") as HTMLSpanElement;
    const parentScope = engine.getScope(parent);

    parentScope.set("count", 12);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(child.textContent).toBe("12");
  });
});
