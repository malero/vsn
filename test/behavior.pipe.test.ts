/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("pipe operator", () => {
  it("pipes into member calls and supports await stages", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        items: [1, 2, 3];

        async prune() {
          items = items
            |> await list.filter((value) => value > 1)
            |> await list.map((value) => value + value);
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

    expect(scope.get("items")).toEqual([4, 6]);
  });

  it("pipes into function references without parentheses", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      use JSON as json;

      behavior .card {
        data: [];

        on click() {
          data = [1, 2] |> json.stringify;
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

    expect(scope.get("data")).toBe("[1,2]");
  });
});
