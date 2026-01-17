/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior lifecycle blocks", () => {
  it("runs construct/destruct blocks for matched elements", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const source = `
      behavior .card {
        construct { ready = true; }
        destruct { ready = false; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(element);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(scope.get("ready")).toBe(true);

    element.remove();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(scope.get("ready")).toBe(false);
  });
});
