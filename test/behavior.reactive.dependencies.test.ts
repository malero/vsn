/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("reactive expression dependencies", () => {
  it("does not re-evaluate for unrelated scope changes", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    let evaluations = 0;
    const engine = new Engine();
    engine.registerGlobal("formatSelection", (selected: boolean) => {
      evaluations += 1;
      return selected ? "selected" : "not-selected";
    });
    engine.registerBehaviors(`
      behavior .card {
        selected: false;
        @data-state :< formatSelection(selected);
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const initialEvaluations = evaluations;

    scope.set("unrelated", true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(initialEvaluations);

    scope.set("selected", true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBeGreaterThan(initialEvaluations);
    expect(card.getAttribute("data-state")).toBe("selected");
  });
});
