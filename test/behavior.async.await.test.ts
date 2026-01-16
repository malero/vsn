/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("async/await in CFS", () => {
  it("supports await in async function declarations", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        value: 0;

        async load() {
          value = await getValue();
        }

        getValue() { return 7; }

        on click() {
          load();
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

    expect(scope.get("value")).toBe(7);
  });

  it("supports await in async arrow functions", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        value: 0;
        setValue = async (amount) => {
          value = await add(amount, 1);
        };

        add(a, b) { return a + b; }

        on click() {
          setValue(2);
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

    expect(scope.get("value")).toBe(3);
  });

  it("treats async as an identifier when not used as a modifier", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const source = `
      behavior .card {
        async: true;

        construct {
          async = false;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("async")).toBe(false);
  });
});
