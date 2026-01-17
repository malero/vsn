/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("vsn-get target errors", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return {
        text: async () => "<span>Loaded</span>",
        ok: true
      } as Response;
    }) as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("emits a target error when selector is missing", async () => {
    document.body.innerHTML = `
      <div id="panel" vsn-get="/fragment" vsn-target="#missing"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const panel = document.getElementById("panel") as HTMLDivElement;
    let fired = false;
    panel.addEventListener("vsn:targetError", () => {
      fired = true;
    });

    panel.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fired).toBe(true);
    expect(panel.innerHTML).toBe("");
  });
});
