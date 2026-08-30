/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("async behavior declarations", () => {
  it("does not allow an older async result to overwrite the latest value", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const engine = new Engine();
    engine.registerGlobal(
      "delayValue",
      (value: string) => new Promise<string>((resolve) => {
        setTimeout(() => resolve(value), value === "slow" ? 35 : 0);
      })
    );
    engine.registerBehaviors(`
      behavior .card {
        value: "initial";
        @data-result :< delayValue(value);
      }
    `);

    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);

    scope.set("value", "slow");
    scope.set("value", "fast");
    await tick(60);

    expect(card.getAttribute("data-result")).toBe("fast");
  });

  it("does not apply a pending result after the behavior unbinds", async () => {
    document.body.innerHTML = `<div class="card active"></div>`;

    const engine = new Engine();
    engine.registerGlobal(
      "delayValue",
      (value: string) => new Promise<string>((resolve) => {
        setTimeout(() => resolve(value), value === "slow" ? 35 : 0);
      })
    );
    engine.registerBehaviors(`
      behavior .card.active {
        value: "initial";
        @data-result :< delayValue(value);
      }
    `);

    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);

    scope.set("value", "slow");
    card.classList.remove("active");
    await tick(60);

    expect(card.getAttribute("data-result")).toBe("initial");
  });
});
