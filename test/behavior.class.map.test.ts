/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("behavior class maps", () => {
  it("adds and removes mapped classes without replacing other classes", async () => {
    document.body.innerHTML = `<div class="card server-rendered"></div>`;

    const source = `
      behavior .card {
        active: false;
        selected: true;
        @class:< {
          "is-active": active,
          "is-selected": selected
        };
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);

    expect(card.classList.contains("card")).toBe(true);
    expect(card.classList.contains("server-rendered")).toBe(true);
    expect(card.classList.contains("is-active")).toBe(false);
    expect(card.classList.contains("is-selected")).toBe(true);

    scope.set("active", true);
    await tick();
    expect(card.classList.contains("is-active")).toBe(true);

    scope.set("selected", false);
    await tick();
    expect(card.classList.contains("is-selected")).toBe(false);
    expect(card.classList.contains("card")).toBe(true);
    expect(card.classList.contains("server-rendered")).toBe(true);
  });

  it("removes classes whose keys disappear from a dynamic map", async () => {
    document.body.innerHTML = `<div id="item" class="item"></div>`;

    const source = `
      behavior #item {
        classes: { first: true };
        @class:< classes;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const item = document.getElementById("item") as HTMLDivElement;
    const scope = engine.getScope(item);

    expect(item.classList.contains("first")).toBe(true);

    scope.set("classes", { second: true });
    await tick();

    expect(item.classList.contains("first")).toBe(false);
    expect(item.classList.contains("second")).toBe(true);
    expect(item.classList.contains("item")).toBe(true);

    const classes = scope.get("classes") as Record<string, boolean>;
    classes.third = true;
    await tick();
    expect(item.classList.contains("third")).toBe(true);

    delete classes.second;
    await tick();
    expect(item.classList.contains("second")).toBe(false);
  });

  it("preserves static classes when an expression-backed map becomes null", async () => {
    document.body.innerHTML = `<div class="card server-rendered"></div>`;

    const source = `
      behavior .card {
        selected: false;
        @class :< selected ? { "is-selected": true } : null;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    expect(card.classList.contains("card")).toBe(true);
    expect(card.classList.contains("server-rendered")).toBe(true);
    expect(card.classList.contains("is-selected")).toBe(false);
  });

  it("allows mapped classes to participate in behavior selectors", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const source = `
      behavior .card {
        active: false;
        @class:< { active: active };
      }

      behavior .card.active {
        construct { matched = true; }
        destruct { matched = false; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);

    expect(scope.get("matched")).toBe(undefined);

    scope.set("active", true);
    await tick(25);
    expect(scope.get("matched")).toBe(true);

    scope.set("active", false);
    await tick(25);
    expect(scope.get("matched")).toBe(false);
  });
});
