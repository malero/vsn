/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior element directive assignment", () => {
  it("supports identifier.@class += on element refs", async () => {
    document.body.innerHTML = `
      <div class="item">
        <span class="menu"></span>
      </div>
    `;

    const source = `
      behavior .item {
        menu: null;

        open() {
          if (menu)
            menu.@class += "open";
        }

        behavior .menu {
          construct {
            menu = self;
          }
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const item = document.querySelector(".item") as HTMLDivElement;
    const menu = document.querySelector(".menu") as HTMLSpanElement;
    const scope = engine.getScope(item);

    await scope.get("open")?.();

    expect(menu.classList.contains("open")).toBe(true);
  });
});
