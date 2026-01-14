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
});
