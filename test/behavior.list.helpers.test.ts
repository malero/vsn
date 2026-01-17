/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("list helpers", () => {
  it("filters arrays with async callbacks", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        items: [1, 2, 3];

        async prune() {
          items = await list.filter(items, (value) => value > 1);
        }

        on click() {
          prune();
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

    expect(scope.get("items")).toEqual([2, 3]);
  });
});
