/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior class changes", () => {
  it("binds and unbinds behaviors when class changes", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const source = `
      behavior .card.active {
        construct { ready = true; }
        destruct { ready = false; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);

    expect(scope.get("ready")).toBe(undefined);

    card.classList.add("active");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scope.get("ready")).toBe(true);

    card.classList.remove("active");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scope.get("ready")).toBe(false);
  });

  it("re-evaluates descendants when ancestor classes change", async () => {
    document.body.innerHTML = `
      <div class="list">
        <div class="item"></div>
      </div>
    `;

    const source = `
      behavior .list.active .item {
        construct { ready = true; }
        destruct { ready = false; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const list = document.querySelector(".list") as HTMLDivElement;
    const item = document.querySelector(".item") as HTMLDivElement;
    const scope = engine.getScope(item);

    expect(scope.get("ready")).toBe(undefined);

    list.classList.add("active");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scope.get("ready")).toBe(true);

    list.classList.remove("active");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scope.get("ready")).toBe(false);
  });
});
