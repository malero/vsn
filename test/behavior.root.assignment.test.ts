/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior root assignments", () => {
  it("updates the behavior root from nested handlers", async () => {
    document.body.innerHTML = `
      <div class="board">
        <button class="card" data-id="alpha">Alpha</button>
        <span class="status"></span>
      </div>
    `;

    const source = `
      behavior .board {
        active: "none";

        behavior .card {
          @data-id :> id;
          on click() {
            root.active = id;
          }
        }

        behavior .status {
          @html :< root.active;
        }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const status = document.querySelector(".status") as HTMLSpanElement;
    const button = document.querySelector(".card") as HTMLButtonElement;
    const board = document.querySelector(".board") as HTMLDivElement;

    expect(status.textContent).toBe("none");

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(status.textContent).toBe("alpha");
    expect(engine.getScope(board).get("active")).toBe("alpha");
  });
});
