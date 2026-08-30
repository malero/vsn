/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("behavior unmount", () => {
  it("runs destructors and removes listeners for the whole subtree", async () => {
    document.body.innerHTML = `
      <div class="card">
        <button class="child"></button>
      </div>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .card {
        clicks: 0;
        on click() { clicks += 1; }
        destruct { destroyed = true; }
      }

      behavior .child {
        clicks: 0;
        on click() { clicks += 1; }
        destruct { destroyed = true; }
      }
    `);

    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const child = document.querySelector(".child") as HTMLButtonElement;
    const cardScope = engine.getScope(card);
    const childScope = engine.getScope(child);

    engine.unmount(card);
    await tick(25);

    expect(cardScope.get("destroyed")).toBe(true);
    expect(childScope.get("destroyed")).toBe(true);

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await tick();

    expect(cardScope.get("clicks")).toBe(0);
    expect(childScope.get("clicks")).toBe(0);
  });
});
