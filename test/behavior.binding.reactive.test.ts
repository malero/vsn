/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior binding reactivity", () => {
  it("updates attributes when scope changes for :< bindings", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const source = `
      behavior .card {
        active: false;
        @aria-pressed :< active;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(element);

    expect(element.getAttribute("aria-pressed")).toBe("false");

    scope.set("active", true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(element.getAttribute("aria-pressed")).toBe("true");
  });
});
