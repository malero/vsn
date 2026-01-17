/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("vsn-bind", () => {
  it("initializes scope from element text", async () => {
    document.body.innerHTML = `
      <span id="name" vsn-bind="name">Vision</span>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const span = document.getElementById("name") as HTMLSpanElement;
    const scope = engine.getScope(span);

    expect(scope.get("name")).toBe("Vision");
  });
});
