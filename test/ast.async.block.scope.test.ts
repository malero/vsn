/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("async block scope", () => {
  it("keeps variables declared after await local to an if block", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const engine = new Engine();
    engine.registerGlobal("delayed", () => Promise.resolve("ready"));
    engine.registerBehaviors(`
      behavior .card {
        construct {
          if (true) {
            localValue = delayed();
            afterValue = localValue;
          }
          outsideValue = "outside";
        }
      }
    `);

    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);

    expect(scope.get("outsideValue")).toBe("outside");
    expect(scope.get("localValue")).toBe(undefined);
    expect(scope.get("afterValue")).toBe(undefined);
  });

  it("keeps variables declared after await local to a try block", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const engine = new Engine();
    engine.registerGlobal("delayed", () => Promise.resolve("ready"));
    engine.registerBehaviors(`
      behavior .card {
        construct {
          try {
            localValue = delayed();
          } catch (error) {
            failed = true;
          }
          outsideValue = "outside";
        }
      }
    `);

    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);

    expect(scope.get("outsideValue")).toBe("outside");
    expect(scope.get("localValue")).toBe(undefined);
    expect(scope.get("failed")).toBe(undefined);
  });
});
