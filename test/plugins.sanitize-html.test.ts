/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";
import { registerSanitizeHtml } from "../src/plugins/sanitize-html";

describe("sanitize-html plugin", () => {
  it("strips unsafe attributes when rendering html", async () => {
    document.body.innerHTML = `
      <div id="target" vsn-html="content"></div>
    `;

    const source = `
      behavior #target {
        construct {
          content = "<img src='x' onerror='alert(1)'><script>alert(2)</script>";
        }
      }
    `;

    const engine = new Engine();
    registerSanitizeHtml(engine);
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const target = document.getElementById("target") as HTMLElement;
    const img = target.querySelector("img") as HTMLImageElement;
    const script = target.querySelector("script");

    expect(img).toBeTruthy();
    expect(img.getAttribute("onerror")).toBe(null);
    expect(script).toBe(null);
  });

  it("preserves all top-level roots during a sanitized outer swap", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => ({
      text: async () => "<span id=\"first\">First</span><span id=\"second\">Second</span>",
      ok: true
    })) as any;
    try {
      document.body.innerHTML = `
        <button id="load" vsn-get="/fragment" vsn-target="#panel" vsn-swap="outer"></button>
        <div id="panel"></div>
      `;

      const engine = new Engine();
      registerSanitizeHtml(engine, { sanitizer: (html) => html });
      await engine.mount(document.body);

      const button = document.getElementById("load") as HTMLButtonElement;
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(document.getElementById("first")).toBeTruthy();
      expect(document.getElementById("second")).toBeTruthy();
      expect(document.getElementById("panel")).toBeNull();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
