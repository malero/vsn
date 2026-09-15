/* @vitest-environment jsdom */
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";
import { registerSanitizeHtml } from "../src/plugins/sanitize-html";

describe("async-search cookbook example", () => {
  it("renders named result fields after the async search completes", async () => {
    const html = await readFile("examples/async-search.html", "utf8");
    const originalFetch = globalThis.fetch;
    document.body.innerHTML = `
      <button id="load" vsn-get="/async-search.html" vsn-target="#example"></button>
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

      const rows = Array.from(document.querySelectorAll("#async-results li"));
      expect(rows.map((row) => row.textContent?.replace(/\s+/g, " ").trim())).toEqual([
        "Schema explorer Ent",
        "Server fragment HTTP",
        "Browser behavior VSN",
        "Lifecycle hooks Runtime",
        "Form bindings DOM"
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
