/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior declaration globals", () => {
  it("resolves registered globals in reactive declarations", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const engine = new Engine();
    engine.registerGlobal("format", (value: string) => value.toUpperCase());
    engine.registerBehaviors(`
      behavior .card {
        value: "ok";
        @data-result :< format(value);
      }
    `);

    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    expect(card.getAttribute("data-result")).toBe("OK");
  });
});
