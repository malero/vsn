/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior function expressions", () => {
  it("supports arrow functions assigned in behavior root", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        add = (a, b) => { return a + b; };
        count: 1;

        on click() {
          count = add(count, 2);
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

    expect(scope.get("count")).toBe(3);
  });

  it("supports arrow functions with no parameters", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        getValue = () => { return 4; };

        on click() {
          value = getValue();
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

    expect(scope.get("value")).toBe(4);
  });
});
