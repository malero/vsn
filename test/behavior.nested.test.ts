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
});
