/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("behavior unbinding cleanup", () => {
  it("stops reactive declarations and removes managed classes after unbinding", async () => {
    document.body.innerHTML = `<div class="card active"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .card.active {
        value: "one";
        @data-value :< value;
        @class:< { mapped: true };
      }
    `);

    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);

    expect(card.getAttribute("data-value")).toBe("one");
    expect(card.classList.contains("mapped")).toBe(true);

    card.classList.remove("active");
    await tick(25);

    expect(card.classList.contains("mapped")).toBe(false);

    scope.set("value", "two");
    await tick(25);

    expect(card.getAttribute("data-value")).toBe("one");
  });
});
