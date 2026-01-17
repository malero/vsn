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
