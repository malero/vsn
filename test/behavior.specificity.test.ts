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

  it("does not count class-like text inside quoted attribute values", async () => {
    document.body.innerHTML = `<div class="card" data-label=".foo"></div>`;

    const source = `
      behavior [data-label=".foo"] { winner: "attribute"; }
      behavior .card { winner: "class"; }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector("div") as HTMLDivElement;
    expect(engine.getScope(element).get("winner")).toBe("class");
  });

  it("honors zero-specificity :where arguments", async () => {
    document.body.innerHTML = `<div class="foo bar"></div>`;

    const source = `
      behavior .bar { winner: "class"; }
      behavior :where(.foo) { winner: "where"; }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector("div") as HTMLDivElement;
    expect(engine.getScope(element).get("winner")).toBe("class");
  });

  it("uses the specificity of the matching comma-group selector", async () => {
    document.body.innerHTML = `<div id="target" class="card"></div>`;

    const source = `
      behavior #target { winner: "id"; }
      behavior .card, #other { winner: "group"; }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    await engine.mount(document.body);

    const element = document.querySelector("div") as HTMLDivElement;
    expect(engine.getScope(element).get("winner")).toBe("id");
  });
});
