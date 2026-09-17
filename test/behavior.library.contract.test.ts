/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior library contract", () => {
  it("keeps public state, ARIA, and semantic visibility driven by one root", async () => {
    document.body.innerHTML = `
      <section class="vsn-example">
        <button
          class="vsn-example__trigger"
          type="button"
          aria-expanded="false"
          aria-controls="example-panel"
        >Toggle</button>
        <div id="example-panel" class="vsn-example__panel" vsn-show="open">
          Content
        </div>
      </section>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .vsn-example !as(example) {
        open: false;

        on keydown!escape() {
          example.open = false;
        }

        .vsn-example__trigger {
          @aria-expanded :< example.open;
          on click() {
            example.open = !example.open;
          }
        }

        .vsn-example__panel {
          @aria-hidden :< !example.open;
        }
      }
    `);
    await engine.mount(document.body);

    const root = document.querySelector(".vsn-example") as HTMLElement;
    const trigger = root.querySelector(".vsn-example__trigger") as HTMLButtonElement;
    const panel = root.querySelector(".vsn-example__panel") as HTMLDivElement;
    const scope = engine.getScope(root);

    expect(scope.get("example.open")).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    expect(panel.hidden).toBe(true);

    trigger.click();

    expect(scope.get("example.open")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.getAttribute("aria-hidden")).toBe("false");
    expect(panel.hidden).toBe(false);

    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(scope.get("example.open")).toBe(false);
    expect(panel.hidden).toBe(true);
  });
});
