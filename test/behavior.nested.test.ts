/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("nested behaviors", () => {
  it("registers behaviors nested inside construct blocks", async () => {
    document.body.innerHTML = `
      <div class="list">
        <div class="item"></div>
      </div>
    `;

    const source = `
      behavior .list {
        construct {
          behavior .item {
            construct { ready = true; }
          }
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const item = document.querySelector(".item") as HTMLDivElement;
    const scope = engine.getScope(item);

    expect(scope.get("ready")).toBe(true);
  });

  it("replaces & with the parent selector for same-element nesting", async () => {
    document.body.innerHTML = `<a id="test"></a>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #test {
        behavior &.active {
          construct { matched = true; }
          destruct { matched = false; }
        }
      }
    `);
    await engine.mount(document.body);

    const test = document.getElementById("test") as HTMLAnchorElement;
    const scope = engine.getScope(test);

    expect(scope.get("matched")).toBe(undefined);

    test.classList.add("active");
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(scope.get("matched")).toBe(true);

    test.classList.remove("active");
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(scope.get("matched")).toBe(false);
  });

  it("expands & across comma-separated parent selectors", async () => {
    document.body.innerHTML = `
      <div class="first"></div>
      <div class="second"></div>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .first, .second {
        behavior &.active {
          construct { matched = true; }
        }
      }
    `);
    await engine.mount(document.body);

    const first = document.querySelector(".first") as HTMLDivElement;
    const second = document.querySelector(".second") as HTMLDivElement;
    first.classList.add("active");
    second.classList.add("active");
    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(engine.getScope(first).get("matched")).toBe(true);
    expect(engine.getScope(second).get("matched")).toBe(true);
  });

  it("rejects & on a root behavior", () => {
    const engine = new Engine();

    expect(() => engine.registerBehaviors("&.active {}"))
      .toThrow("Nesting selector '&' requires a parent behavior");
  });

  it("requires nested behaviors after construct, functions, and on blocks", async () => {
    document.body.innerHTML = `<div class="card"><span class="item"></span></div>`;

    const source = `
      behavior .card {
        behavior .item {
          construct { ready = true; }
        }

        construct { }

        on click() { }
      }
    `;

    const engine = new Engine();
    expect(() => engine.registerBehaviors(source)).toThrow(
      "Nested behaviors must appear after construct, function, and on blocks"
    );
  });
});
