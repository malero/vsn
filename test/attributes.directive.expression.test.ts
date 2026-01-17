/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("directive expressions", () => {
  it("reads attributes from the current element", async () => {
    document.body.innerHTML = `<button class="card" data-id="alpha"></button>`;

    const source = `
      behavior .card {
        last: "";
        on click() {
          last = @data-id;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(element);

    element.dispatchEvent(new Event("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(scope.get("last")).toBe("alpha");
  });
});
