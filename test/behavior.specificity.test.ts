/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior specificity ordering", () => {
  it("prefers more specific selectors for declarations", async () => {
    document.body.innerHTML = `<div id="hero" class="card"></div>`;

    const source = `
      behavior .card {
        testing: false;
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

    expect(scope.get("testing")).toBe(true);
  });

  it("uses source order when specificity ties", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const source = `
      behavior .card { count: 1; }
      behavior .card { count: 2; }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("count")).toBe(2);
  });
});
