/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("element directive class ops via proxies", () => {
  it("preserves existing classes when using menu.@class += inside behavior", async () => {
    document.body.innerHTML = `
      <nav class="site-nav-item">
        <div class="site-sub-nav"></div>
      </nav>
    `;

    const source = `
      behavior .site-nav-item {
        menu: null;

        open() {
          if (menu) {
            menu.@class += "open";
          }
        }

        behavior .site-sub-nav {
          construct {
            menu = self;
          }
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const nav = document.querySelector(".site-nav-item") as HTMLElement;
    const menu = document.querySelector(".site-sub-nav") as HTMLElement;
    const scope = engine.getScope(nav);

    await scope.get("open")?.();

    expect(menu.classList.contains("site-sub-nav")).toBe(true);
    expect(menu.classList.contains("open")).toBe(true);
  });
});
