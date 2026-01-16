/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior function declarations", () => {
  it("calls root functions and uses return values", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        add(a, b) { return a + b; }
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

  it("overrides functions with more specific behaviors", async () => {
    document.body.innerHTML = `<button class="card active"></button>`;

    const source = `
      behavior .card {
        getValue() { return 1; }
      }

      behavior .card.active {
        getValue() { return 2; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(element);
    const fn = scope.get("getValue") as (() => Promise<number>) | undefined;

    expect(fn).toBeTypeOf("function");
    expect(await fn?.()).toBe(2);
  });

  it("throws when a function overrides a non-function", async () => {
    document.body.innerHTML = `<button class="card active"></button>`;

    const source = `
      behavior .card {
        value: 1;
      }

      behavior .card.active {
        value() { return 2; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);

    await expect(engine.mount(document.body)).rejects.toThrow("value");
  });
});
