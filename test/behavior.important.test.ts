/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior !important", () => {
  it("prevents more specific selectors from overriding state", async () => {
    document.body.innerHTML = `<div id="hero" class="card"></div>`;

    const source = `
      behavior .card {
        testing: false !important;
      }

      behavior #hero.card {
        testing: true;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.getElementById("hero") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("testing")).toBe(false);
  });
});
