/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("bare selector behaviors", () => {
  it("binds a bare ID selector and its reactive declarations", async () => {
    document.body.innerHTML = `
      <div id="dropdown" class="menu"></div>
      <div id="other" class="menu"></div>
    `;

    const source = `
      #dropdown {
        open: false;
        @class :< { "is-open": open };
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const dropdown = document.getElementById("dropdown") as HTMLDivElement;
    const other = document.getElementById("other") as HTMLDivElement;
    const scope = engine.getScope(dropdown);

    expect(dropdown.classList.contains("is-open")).toBe(false);
    expect(other.classList.contains("is-open")).toBe(false);

    scope.set("open", true);
    await tick();

    expect(dropdown.classList.contains("is-open")).toBe(true);
    expect(dropdown.classList.contains("menu")).toBe(true);
    expect(other.classList.contains("is-open")).toBe(false);
  });

  it("registers bare nested selectors with the parent selector", async () => {
    document.body.innerHTML = `
      <div class="list">
        <span class="item"></span>
      </div>
    `;

    const source = `
      .list {
        .item {
          construct { ready = true; }
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const item = document.querySelector(".item") as HTMLSpanElement;
    expect(engine.getScope(item).get("ready")).toBe(true);
  });
});
