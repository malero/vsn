/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior on key modifiers", () => {
  it("supports keyup.enter in CFS on blocks", async () => {
    document.body.innerHTML = `<input class="field" />`;

    const source = `
      behavior .field {
        count: 0;

        on keyup.enter() {
          count = count + 1;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const field = document.querySelector(".field") as HTMLInputElement;
    const scope = engine.getScope(field);

    field.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(scope.get("count")).toBe(1);
  });
});
