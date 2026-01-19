/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior function declarations", () => {
  it("calls root functions and uses return values", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        count: 1;
        
        construct {
        }

        add(a, b) { return a + b; }

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

  it("requires construct before function declarations and on blocks when construct is present", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        count: 0;

        add(a, b) { return a + b; }

        construct { }
      
        on click() {
          count = add(count, 1);
        }
      }
    `;

    const engine = new Engine();
    expect(() => engine.registerBehaviors(source)).toThrow("construct");
  });

  it("allows control flow blocks inside function bodies", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        count: 0;

        total(n) {
          sum = 0;
          i = 0;
          while (i < n) {
            sum = sum + i;
            i = i + 1;
          }
          if (sum >= 0) {
            sum = sum + 1;
          }
          for (j = 0; j < 1; j = j + 1) {
            sum = sum + 1;
          }
          return sum;
        }

        on click() {
          count = total(3);
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

    expect(scope.get("count")).toBe(5);
  });

  it("allows return inside nested blocks in function bodies", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        decide(value) {
          if (value > 0) {
            return "positive";
          }
          return "other";
        }

        on click() {
          result = decide(1);
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

    expect(scope.get("result")).toBe("positive");
  });
});
