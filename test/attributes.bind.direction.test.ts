/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-bind direction", () => {
  it("bind:to updates scope from element", async () => {
    document.body.innerHTML = `
      <span id="name" vsn-bind:to="name">Vision</span>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const span = document.getElementById("name") as HTMLSpanElement;
    const scope = engine.getScope(span);

    expect(scope.get("name")).toBe("Vision");
  });

  it("bind:from updates element from scope", async () => {
    document.body.innerHTML = `
      <span id="name" vsn-bind:from="name"></span>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const span = document.getElementById("name") as HTMLSpanElement;
    const scope = engine.getScope(span);
    scope.set("name", "Vision");

    engine.evaluate(span);
    expect(span.textContent).toBe("Vision");
  });

  it("bind default updates scope and element", async () => {
    document.body.innerHTML = `
      <span id="name" vsn-bind="name">First</span>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const span = document.getElementById("name") as HTMLSpanElement;
    const scope = engine.getScope(span);

    expect(scope.get("name")).toBe("First");

    scope.set("name", "Second");
    engine.evaluate(span);

    expect(span.textContent).toBe("Second");
  });
});
