/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("vsn-get default target", () => {
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

  it("swaps into the element when no vsn-target is set", async () => {
    document.body.innerHTML = `
      <div id="panel" vsn-get="/fragment"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const panel = document.getElementById("panel") as HTMLDivElement;
    panel.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(panel.innerHTML).toBe("<span>Loaded</span>");
  });
});
