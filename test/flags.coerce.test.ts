/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("declaration modifier coercion", () => {
  it("coerces declaration values with !int and !float", async () => {
    document.body.innerHTML = `<div id="card"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #card {
        count: "10" !int;
        ratio: "10.5" !float;
        raw: "nope" !int;
      }
    `);
    await engine.mount(document.body);

    const element = document.getElementById("card") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("count")).toBe(10);
    expect(scope.get("ratio")).toBe(10.5);
    expect(scope.get("raw")).toBe("nope");
  });

  it("coerces values from directives with !int", async () => {
    document.body.innerHTML = `<div id="card" data-count="42"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #card {
        @data-count :> count !int;
      }
    `);
    await engine.mount(document.body);

    const element = document.getElementById("card") as HTMLDivElement;
    const scope = engine.getScope(element);

    expect(scope.get("count")).toBe(42);
  });
});
