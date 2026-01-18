/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("vsn:error for behavior on blocks", () => {
  it("emits vsn:error when a behavior handler throws", async () => {
    document.body.innerHTML = `
      <div class="card"></div>
    `;

    const engine = new Engine({ logger: { warn: vi.fn() } });
    engine.registerGlobal("boom", () => {
      throw new Error("boom");
    });
    engine.registerBehaviors(`
      behavior .card {
        on click() { boom(); }
      }
    `);

    const listener = vi.fn();
    document.addEventListener("vsn:error", listener);

    await engine.mount(document.body);
    const card = document.querySelector(".card") as HTMLDivElement;
    card.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(listener).toHaveBeenCalled();
    const detail = listener.mock.calls[0]?.[0]?.detail;
    expect(detail.error).toBeInstanceOf(Error);
    expect(detail.selector).toBe("div.card");
  });
});
