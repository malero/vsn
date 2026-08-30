/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("vsn-get swap", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return {
        text: async () => "<span id=\"replace\">Loaded</span>",
        ok: true
      } as Response;
    }) as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("replaces target with outer swap", async () => {
    document.body.innerHTML = `
      <button id="load" vsn-get="/fragment" vsn-target="#panel" vsn-swap="outer"></button>
      <div id="panel"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const button = document.getElementById("load") as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    const replaced = document.getElementById("replace");
    expect(replaced).toBeTruthy();
    expect(document.getElementById("panel")).toBeNull();
  });

  it("preserves all top-level roots during an outer swap", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      text: async () => "<span id=\"first\">First</span><span id=\"second\">Second</span>",
      ok: true
    });
    document.body.innerHTML = `
      <button id="load" vsn-get="/fragment" vsn-target="#panel" vsn-swap="outer"></button>
      <div id="panel"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const button = document.getElementById("load") as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.getElementById("first")).toBeTruthy();
    expect(document.getElementById("second")).toBeTruthy();
    expect(document.getElementById("panel")).toBeNull();
  });
});
