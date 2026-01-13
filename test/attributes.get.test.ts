/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("vsn-get", () => {
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

  it("fetches HTML and swaps into target on click", async () => {
    document.body.innerHTML = `
      <button id="load" vsn-get="/fragment" vsn-target="#panel"></button>
      <div id="panel"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const button = document.getElementById("load") as HTMLButtonElement;
    const panel = document.getElementById("panel") as HTMLDivElement;

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(panel.innerHTML).toBe("<span>Loaded</span>");
  });
});
