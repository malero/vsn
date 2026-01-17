/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior declarations", () => {
  it("applies state init and attr bindings", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        active: true;
        @aria-pressed : active;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(element);

    expect(scope.get("active")).toBe(true);
    expect(element.getAttribute("aria-pressed")).toBe("true");
  });
});
