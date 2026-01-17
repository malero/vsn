/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior on event args", () => {
  it("binds the event argument inside on blocks", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        on click(event) {
          seen = event.type;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(element);

    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(scope.get("seen")).toBe("click");
  });

  it("parses expression statements that start with identifiers", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        seen: false;

        mark() {
          seen = true;
        }

        on click(event) {
          event && mark();
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(element);

    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(scope.get("seen")).toBe(true);
  });
});
