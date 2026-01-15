/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior observer", () => {
  it("binds behaviors for newly added elements", async () => {
    document.body.innerHTML = `<div id="root"></div>`;

    const source = `
      behavior .card {
        construct { ready = true; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const root = document.getElementById("root") as HTMLDivElement;
    const card = document.createElement("div");
    card.className = "card";
    root.appendChild(card);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const scope = engine.getScope(card);
    expect(scope.get("ready")).toBe(true);
  });
});
