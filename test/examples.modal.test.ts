/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

import { Engine } from "../src/index";
import { registerSanitizeHtml } from "../src/plugins/sanitize-html";

describe("modal cookbook example", () => {
  it("loads its CFS behavior and opens through the fragment path", async () => {
    const html = await readFile("examples/modal.html", "utf8");
    const originalFetch = globalThis.fetch;
    document.body.innerHTML = `
      <button id="load" vsn-get!trusted="/modal.html" vsn-target="#example"></button>
      <main id="example"></main>
    `;

    globalThis.fetch = (async () => ({ ok: true, text: async () => html })) as typeof fetch;
    try {
      const engine = new Engine();
      registerSanitizeHtml(engine);
      await engine.mount(document.body);

      const load = document.getElementById("load") as HTMLButtonElement;
      load.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 30));

      const launch = document.getElementById("modal-launch") as HTMLButtonElement;
      const backdrop = document.getElementById("modal-backdrop") as HTMLElement;
      const root = document.getElementById("modal-example") as HTMLElement;

      expect(backdrop.style.display).toBe("none");
      launch.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(engine.getScope(root).get("open")).toBe(true);
      expect(backdrop.style.display).toBe("");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
