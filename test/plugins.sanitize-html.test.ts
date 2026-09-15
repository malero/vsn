/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";
import { registerSanitizeHtml } from "../src/plugins/sanitize-html";

describe("sanitize-html plugin", () => {
  it("preserves VSN behavior scripts while stripping executable scripts", async () => {
    document.body.innerHTML = `<div id="target"></div>`;

    const engine = new Engine();
    registerSanitizeHtml(engine);
    await engine.mount(document.body);

    const target = document.getElementById("target") as HTMLElement;
    engine.setHtml(target, `
      <div class="card"></div>
      <script type="text/vsn">
        behavior .card {
          construct { ready = true; }
        }
      </script>
      <script>window.bad = true;</script>
    `);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(target.querySelector("script[type='text/vsn']")).toBeTruthy();
    expect(target.querySelector("script:not([type='text/vsn'])")).toBeNull();
    expect(engine.getScope(target.querySelector(".card") as HTMLElement).get("ready")).toBe(true);
  });

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

  it("sends htmx-compatible partial request headers", async () => {
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(async () => ({
      text: async () => "<span>Loaded</span>",
      ok: true
    })) as any;
    globalThis.fetch = fetchMock;
    try {
      document.body.innerHTML = `
        <button id="load" name="load-fragment" vsn-get="/fragment" vsn-target="#panel"></button>
        <div id="panel"></div>
      `;

      const engine = new Engine();
      registerSanitizeHtml(engine, { sanitizer: (html) => html });
      await engine.mount(document.body);

      const button = document.getElementById("load") as HTMLButtonElement;
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));

      const request = fetchMock.mock.calls[0];
      const headers = new Headers(request[1].headers);
      expect(headers.get("HX-Request")).toBe("true");
      expect(headers.get("HX-Current-URL")).toBe(window.location.href);
      expect(headers.get("HX-Target")).toBe("panel");
      expect(headers.get("HX-Trigger")).toBe("load");
      expect(headers.get("HX-Trigger-Name")).toBe("load-fragment");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
