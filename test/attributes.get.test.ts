/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

describe("vsn-get", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
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

  it("fetches HTML and swaps into target on mount when !load is set", async () => {
    document.body.innerHTML = `
      <div id="panel" vsn-get!load="/fragment"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const panel = document.getElementById("panel") as HTMLDivElement;
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(panel.innerHTML).toBe("<span>Loaded</span>");
  });

  it("does not trigger when clicking a child element", async () => {
    document.body.innerHTML = `
      <div id="panel" vsn-get="/fragment">
        <button id="child"></button>
      </div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    const child = document.getElementById("child") as HTMLButtonElement;
    const panel = document.getElementById("panel") as HTMLDivElement;

    child.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(panel.innerHTML).toContain("<button");
  });

  it("parses behaviors from vsn-get html", async () => {
    document.body.innerHTML = `
      <div id="panel" vsn-get="/test"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    (globalThis.fetch as any) = vi.fn(async () => ({
      ok: true,
      text: async () => `
        <div class="card"></div>
        <script type="text/vsn">
          behavior .card {
            construct { ready = true; }
          }
        </script>
      `
    }));

    const panel = document.getElementById("panel") as HTMLDivElement;
    panel.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    const card = panel.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    expect(scope.get("ready")).toBe(true);
  });

  it("emits vsn:getError when HTML contains invalid CFS", async () => {
    document.body.innerHTML = `
      <div id="panel" vsn-get="/bad"></div>
    `;

    const engine = new Engine();
    await engine.mount(document.body);

    let errorEvent: CustomEvent | null = null;
    document.addEventListener("vsn:getError", (event) => {
      errorEvent = event as CustomEvent;
    });

    (globalThis.fetch as any) = vi.fn(async () => ({
      ok: true,
      text: async () => `
        <script type="text/vsn">
          behavior .card {
            async load( { }
          }
        </script>
      `
    }));

    const panel = document.getElementById("panel") as HTMLDivElement;
    panel.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorEvent).toBeTruthy();
  });
});
