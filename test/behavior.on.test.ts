/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior on blocks", () => {
  it("runs on block handlers for matched elements", async () => {
    document.body.innerHTML = `<button class="card">Tap</button>`;

    const source = `
      behavior .card {
        construct { count = 0; }
        on click() { count = count + 1; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(element);

    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(scope.get("count")).toBe(1);
  });
});
