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

  it("binds vsn-get handlers to links introduced by successive inner swaps", async () => {
    document.body.innerHTML = `
      <section id="spec-tabs" class="spec-tabs" aria-label="Spec tabs">
        <nav class="spec-discussion-tabs" aria-label="Spec tabs">
          <a class="spec-discussion-tab is-active" href="/details" vsn-get!trusted="/details" vsn-swap="inner" vsn-target="#spec-tabs"><span>Details</span></a>
          <a class="spec-discussion-tab" href="/comments" vsn-get!trusted="/comments" vsn-swap="inner" vsn-target="#spec-tabs"><span>Comments</span></a>
        </nav>
        <div id="spec-tab-content"><p>Details</p></div>
      </section>
    `;

    (globalThis.fetch as any).mockImplementation(async (input: string) => ({
      ok: true,
      text: async () => input === "/details"
        ? `
          <nav class="spec-discussion-tabs" aria-label="Spec tabs">
            <a class="spec-discussion-tab" href="/details" vsn-get!trusted="/details" vsn-swap="inner" vsn-target="#spec-tabs"><span>Details</span></a>
            <a class="spec-discussion-tab is-active" href="/comments" vsn-get!trusted="/comments" vsn-swap="inner" vsn-target="#spec-tabs"><span>Comments</span></a>
          </nav>
          <div id="spec-tab-content"><p>Comments</p></div>
        `
        : `
          <nav class="spec-discussion-tabs" aria-label="Spec tabs">
            <a class="spec-discussion-tab is-active" href="/details" vsn-get!trusted="/details" vsn-swap="inner" vsn-target="#spec-tabs"><span>Details</span></a>
            <a class="spec-discussion-tab" href="/comments" vsn-get!trusted="/comments" vsn-swap="inner" vsn-target="#spec-tabs"><span>Comments</span></a>
          </nav>
          <div id="spec-tab-content"><p>Details again</p></div>
        `
    }));

    const engine = new Engine();
    await engine.mount(document.body);

    (document.querySelector('a[href="/details"] span') as HTMLSpanElement).click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    (document.querySelector('a[href="/comments"] span') as HTMLSpanElement).click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelector("#spec-tab-content")?.textContent).toContain("Details again");
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
